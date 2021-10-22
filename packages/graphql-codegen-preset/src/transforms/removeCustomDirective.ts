import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, visit } from 'graphql';
import { ARGUMENTS_DIRECTIVE_NAME, ARGUMENT_DEFINITIONS_DIRECTIVE_NAME } from './applyArgumentDefinitions';
import { REFETCHABLE_DIRECTIVE_NAME } from './generateRefetchQuery';

const DIRECTIVES = [ARGUMENT_DEFINITIONS_DIRECTIVE_NAME, ARGUMENTS_DIRECTIVE_NAME, REFETCHABLE_DIRECTIVE_NAME];

const transform = ({
  documentFiles,
}: {
  documentFiles: Types.DocumentFile[];
}): { documentFiles: Types.DocumentFile[] } => {
  const files = documentFiles.map((file) => {
    if (!file.document) return file;

    file.document = visit(file.document, {
      Directive: {
        enter(node) {
          if (DIRECTIVES.includes(node.name.value)) {
            return null;
          }
        },
      },
    }) as DocumentNode;
    return file;
  });

  return { documentFiles: files };
};

export default transform;
