import { useEffect, useRef, useState } from 'react';
import {
  DraftHandleValue,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import CodeSnippet from './CodeSnippet';

enum EditTypes {
  H1 = '#',
  CODE = '```',
  BOLD = '*',
  REDTEXT = '**',
  UNDERLINE = '***',
}

const CustomEditor = () => {
  const editor = useRef<Editor>(null);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const onChange = (eS: EditorState) => {
    setEditorState(eS);
  };

  useEffect(() => {
    editor.current?.focus();
  }, []);

  const handleBeforeInput: (
    chars: string,
    editorState: EditorState
  ) => DraftHandleValue = (chars, eS) => {
    console.log('Chars', chars);
    const selection = eS.getSelection();
    const block = eS
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    const text = block.getText();

    console.log('text', text);
    console.log('text.length', text.length);

    if (chars === ' ' && Object.values(EditTypes).includes(text as any)) {
      const currBlockType = RichUtils.getCurrentBlockType(eS);
      const inlineStyles = eS.getCurrentInlineStyle();

      let newState;
      console.log('currBlockType', currBlockType);

      const newContentState = Modifier.replaceText(
        eS.getCurrentContent(),
        selection.merge({
          anchorOffset: selection.getStartOffset() - text.length,
          focusOffset: selection.getStartOffset(),
        }),
        ''
      );
      newState = EditorState.push(eS, newContentState, 'delete-character');

      if (text === EditTypes.H1 && currBlockType !== 'header-one') {
        newState = RichUtils.toggleBlockType(newState, 'header-one');
      } else if (text === EditTypes.CODE && currBlockType !== 'CODE') {
        newState = RichUtils.toggleBlockType(newState, 'CODE');
      } else if (text === EditTypes.BOLD && !inlineStyles.has('BOLD')) {
        newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
      } else if (text === EditTypes.REDTEXT && !inlineStyles.has('REDTEXT')) {
        newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
      } else if (
        text === EditTypes.UNDERLINE &&
        !inlineStyles.has('UNDERLINE')
      ) {
        newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
      }

      if (newState) {
        const newBlockType = RichUtils.getCurrentBlockType(newState);
        console.log('newBlockType', newBlockType);

        onChange(newState);
        return 'handled';
      }
    }
    return 'not-handled';
  };

  return (
    <div className='h-[calc(100%-110px)] mx-10 flex'>
      <div className='border h-full p-2 w-1/2'>
        <Editor
          ref={editor}
          placeholder='Type your text here...'
          editorState={editorState}
          onChange={onChange}
          handleBeforeInput={handleBeforeInput}
          handleReturn={(_, eS) => {
            const currContentState = eS.getCurrentContent();
            const currSelection = eS.getSelection();

            const newContentState = Modifier.splitBlock(
              currContentState,
              currSelection
            );

            const newEditorState = EditorState.push(
              eS,
              newContentState,
              'split-block'
            );

            let newState = RichUtils.toggleBlockType(
              newEditorState,
              'unstyled'
            );

            const inlineStyles = newState.getCurrentInlineStyle();

            if (inlineStyles.has('BOLD')) {
              newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
            }
            if (inlineStyles.has('UNDERLINE')) {
              newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
            }
            if (inlineStyles.has('REDTEXT')) {
              newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
            }

            onChange(newState);
            return 'handled';
          }}
          customStyleMap={{
            REDTEXT: {
              color: 'red',
            },
          }}
          blockRendererFn={(block) => {
            if (block.getType() === 'CODE') {
              return {
                component: CodeSnippet,
                editable: true,
              };
            }
          }}
        />
      </div>
      <div className='border h-full w-1/2'>
        <pre>
          {JSON.stringify(editorState.getCurrentContent().toJS(), null, 4)}
        </pre>
      </div>
    </div>
  );
};

export default CustomEditor;
