import { EditorBlock } from 'draft-js';

// interface ICodeSnippet {
//   contentState: ContentState;
//   block: ContentBlock;
//   selection: SelectionState;
// }

const CodeSnippet = (props: any) => {
  return (
    <div className='bg-gray-100 p-1 border border-gray-300 rounded'>
      <EditorBlock {...props} />
    </div>
  );
};

export default CodeSnippet;
