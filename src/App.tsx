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
  const [isSaving, setIsSaving] = useState(false);

  const onSave = () => {
    const currContent = editorState.getCurrentContent();
    const rawContent = convertToRaw(currContent);
    setIsSaving(true);
    localStorage.setItem('data', JSON.stringify(rawContent));
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className='h-full'>
      <div className='flex items-center justify-center pt-10 mx-10 md:mx-auto max-w-2xl'>
        <p className='flex-1 text-center'>Demo Editor by Prakash</p>
        <button
          className='px-4 py-1.5 m-3 rounded glass transition-all w-20'
          onClick={onSave}
        >
          {isSaving ? 'Saved' : 'Save'}
        </button>
      </div>
      <CustomEditor editorState={editorState} setEditorState={setEditorState} />
    </div>
  );
}

export default App;
