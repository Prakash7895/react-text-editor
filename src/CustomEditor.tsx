import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';
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

interface ICustomEditor {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
}

const CustomEditor: FC<ICustomEditor> = ({ editorState, setEditorState }) => {
  const editor = useRef<Editor>(null);

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
    const selection = eS.getSelection();
    const block = eS
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey());
    const text = block.getText();

    if (chars === ' ' && Object.values(EditTypes).includes(text as any)) {
      const currBlockType = RichUtils.getCurrentBlockType(eS);

      let newState;

      const newContentState = Modifier.replaceText(
        eS.getCurrentContent(),
        selection.merge({
          anchorOffset: selection.getStartOffset() - text.length,
          focusOffset: selection.getStartOffset(),
        }),
        ''
      );
      newState = EditorState.push(eS, newContentState, 'delete-character');

      const inlineStyles = newState.getCurrentInlineStyle();

      let removeInlineStyle = false;

      if (text === EditTypes.H1 && currBlockType !== 'header-one') {
        newState = RichUtils.toggleBlockType(newState, 'header-one');
        removeInlineStyle = true;
      } else if (text === EditTypes.CODE && currBlockType !== 'CODE') {
        newState = RichUtils.toggleBlockType(newState, 'CODE');
        removeInlineStyle = true;
      } else if (text === EditTypes.BOLD) {
        if (!inlineStyles.has('BOLD')) {
          newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
        }
        if (inlineStyles.has('UNDERLINE')) {
          newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
        }
        if (inlineStyles.has('REDTEXT')) {
          newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
        }
      } else if (text === EditTypes.REDTEXT) {
        if (inlineStyles.has('BOLD')) {
          newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
        }
        if (inlineStyles.has('UNDERLINE')) {
          newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
        }
        if (!inlineStyles.has('REDTEXT')) {
          newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
        }
      } else if (text === EditTypes.UNDERLINE) {
        if (inlineStyles.has('BOLD')) {
          newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
        }
        if (!inlineStyles.has('UNDERLINE')) {
          newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
        }
        if (inlineStyles.has('REDTEXT')) {
          newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
        }
      }

      if (removeInlineStyle) {
        if (inlineStyles.has('BOLD')) {
          newState = RichUtils.toggleInlineStyle(newState, 'BOLD');
        }
        if (inlineStyles.has('UNDERLINE')) {
          newState = RichUtils.toggleInlineStyle(newState, 'UNDERLINE');
        }
        if (inlineStyles.has('REDTEXT')) {
          newState = RichUtils.toggleInlineStyle(newState, 'REDTEXT');
        }
      }

      if (newState) {
        onChange(newState);
        return 'handled';
      }
    }

    return 'not-handled';
  };

  const handleReturn: (e: any, editorState: EditorState) => DraftHandleValue = (
    _,
    eS
  ) => {
    const currContentState = eS.getCurrentContent();
    const currSelection = eS.getSelection();

    const newContentState = Modifier.splitBlock(
      currContentState,
      currSelection
    );

    const newEditorState = EditorState.push(eS, newContentState, 'split-block');

    let newState = RichUtils.toggleBlockType(newEditorState, 'unstyled');

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
  };

  const handleKeyCommand: (
    command: string,
    editorState: EditorState
  ) => DraftHandleValue = (command, eS) => {
    if (command === 'backspace') {
      const currContentState = eS.getCurrentContent();
      const currSelection = eS.getSelection();

      const newContentState = Modifier.replaceText(
        currContentState,
        currSelection.merge({
          anchorOffset: currSelection.getStartOffset() - 1,
          focusOffset: currSelection.getStartOffset(),
        }),
        ''
      );

      const newEditorState = EditorState.push(
        eS,
        newContentState,
        'delete-character'
      );

      const selection = newEditorState.getSelection();

      if (selection.getEndOffset() < 0) {
        return 'not-handled';
      }

      const inlineStyles = newEditorState.getCurrentInlineStyle();

      let newState = newEditorState;

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
    }
    return 'not-handled';
  };

  return (
    <div className='h-[calc(100%-110px)] mx-10 flex'>
      <div className='border h-full p-2 flex-1'>
        <Editor
          ref={editor}
          placeholder='Type your text here...'
          editorState={editorState}
          onChange={onChange}
          handleBeforeInput={handleBeforeInput}
          handleReturn={handleReturn}
          handleKeyCommand={handleKeyCommand}
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
