import type { ComponentPublicInstance } from "@vue/runtime-dom";
import { createApp, h } from "@vue/runtime-dom";
import {
  Block,
  FileBlockProps,
  FileContext,
  FolderBlockProps,
  FolderContext,
} from "@githubnext/blocks";
import { init } from "@githubnext/blocks-runtime";
import BlockComponent from "./BlockComponent.vue";

import "./index.css";

// redirect from the server to the production blocks frame
if (window === window.top) {
  window.location.href = `https://blocks.githubnext.com/githubnext/blocks?devServer=${encodeURIComponent(
    window.location.href
  )}`;
}

type BlockProps = FileBlockProps | FolderBlockProps;

const loadDevServerBlock = async (block: Block) => {
  const imports = import.meta.glob("../blocks/**");
  const importPath = "../" + block.entry;
  const component = await imports[importPath]();

  let instance: ComponentPublicInstance;

  return (props: BlockProps) => {
    if (!instance) {
      // need this wrapper component to be able to update props by modifying `component.$data`;
      // if we mount `content.default` directly, we can't update the props passed to `createApp` (???)
      const app = createApp({
        data() {
          return {
            ...props,
            BlockComponent: getBlockComponentWithParentContext(props.context),
          };
        },
        render() {
          // @ts-ignore
          return h(component.default, {
            ...Object.fromEntries(
              Object.keys(props).map((key) => [key, this[key]])
            ),
            BlockComponent: this.BlockComponent,
          });
        },
      });
      instance = app.mount("#root");
    } else {
      for (const key in props) {
        // @ts-ignore
        instance.$data[key] = props[key];
      }
      // @ts-ignore
      instance.$data["BlockComponent"] = getBlockComponentWithParentContext(
        props.context
      );
    }
  };
};

init(loadDevServerBlock);

// TODO(jaked)
// returning a new render function causes the component to remount
const getBlockComponentWithParentContext = (
  parentContext?: FileContext | FolderContext
) => {
  // @ts-ignore
  return (props) => {
    let context = {
      ...(parentContext || {}),
      ...(props.context || {}),
    };

    if (parentContext) {
      // clear sha if viewing content from another repo
      const parentRepo = [parentContext.owner, parentContext.repo].join("/");
      const childRepo = [context.owner, context.repo].join("/");
      const isSameRepo = parentRepo === childRepo;
      if (!isSameRepo) {
        context.sha = props.context?.sha || "HEAD";
      }
    }

    const fullProps = {
      ...props,
      context,
    };

    return h(BlockComponent, fullProps);
  };
};
