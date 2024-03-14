import { useState } from 'react';
import './App.css';
import CustomEditor from './CustomEditor';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

function App() {
  const [editorState, setEditorState] = useState(() => {
    const savedData = localStorage.getItem('data');
    const parsedData = savedData ? JSON.parse(savedData) : null;
    return parsedData
      ? EditorState.createWithContent(convertFromRaw(parsedData))
      : EditorState.createEmpty();
  });

  const onSave = () => {
    const currContent = editorState.getCurrentContent();
    const rawContent = convertToRaw(currContent);
    localStorage.setItem('data', JSON.stringify(rawContent));
  };

  return (
    <div className='h-full'>
      <div className='flex items-center justify-center pt-10 mx-10'>
        <p className='flex-1 text-center'>Demo Editor by Prakash</p>
        <button
          className='px-4 py-1.5 m-3 text-gray-100 bg-violet-600 rounded'
          onClick={onSave}
        >
          Save
        </button>
      </div>
      <CustomEditor editorState={editorState} setEditorState={setEditorState} />
    </div>
  );
}

export default App;
