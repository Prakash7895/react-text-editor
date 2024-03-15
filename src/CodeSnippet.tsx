import { EditorBlock } from 'draft-js';

const CodeSnippet = (props: any) => {
  return (
    <pre className='bg-gray-100 p-1 border-l-2 border-gray-300 mx-0.5'>
      <EditorBlock {...props} />
    </pre>
  );
};

export default CodeSnippet;
