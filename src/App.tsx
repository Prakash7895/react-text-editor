import './App.css';
import CustomEditor from './CustomEditor';

function App() {
  return (
    <div className='h-full'>
      <div className='flex items-center justify-center pt-10 mx-10'>
        <p className='flex-1 text-center'>Demo Editor by Prakash</p>
        <button className='px-4 py-1.5 m-3 text-gray-100 bg-violet-600 rounded'>
          Save
        </button>
      </div>
      <CustomEditor />
    </div>
  );
}

export default App;
