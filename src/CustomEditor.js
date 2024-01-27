import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw, Modifier, SelectionState } from 'draft-js';
import './CustomEditorStyles.css';

const CustomEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)));
    }
    return EditorState.createEmpty();
  });

  // useEffect(() => {
  //   const contentState = editorState.getCurrentContent();
  //   const rawContentState = convertToRaw(contentState);
  //   localStorage.setItem('editorContent', JSON.stringify(rawContentState));
  // }, [editorState]);

  // const handleKeyCommand = (command, editorState) => {
  //   const newState = RichUtils.handleKeyCommand(editorState, command);
  //   if (newState) {
  //     setEditorState(newState);
  //     return 'handled';
  //   }
  //   return 'not-handled';
  // };

  const handleKeyCommand = (command, editorState) => {
    if (command === 'add-heading') {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const blockKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const blockText = block.getText();
      if (blockText.startsWith('#') && selectionState.getStartOffset() === 1) {
        let newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({ anchorOffset: 0 }),
          '',
          undefined,
          undefined
        );
        newContentState = Modifier.setBlockType(newContentState, selectionState, 'header-one');
        setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));
        return 'handled';
      }
    } else if (command === 'make-bold') {
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const blockKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const blockText = block.getText();
      if (blockText.startsWith('*') && selectionState.getStartOffset() === 1) {
        const updatedContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({ anchorOffset: 0 }),
          '',
          undefined,
          undefined
        );
        const newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, updatedContentState, 'remove-range'),
          'BOLD'
        );
        setEditorState(newEditorState);
        return 'handled';
      }
    } else if (command === 'make-red') {
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const blockKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const blockText = block.getText();
      if (blockText.startsWith('**') && selectionState.getStartOffset() === 2) {
        const updatedContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({ anchorOffset: 0 }),
          '',
          undefined,
          undefined
        );
        const newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, updatedContentState, 'remove-range'),
          'COLOR-RED'
        );
        setEditorState(newEditorState);
        return 'handled';
      }
    } else if (command === 'add-underline') {
      const selectionState = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const blockKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const blockText = block.getText();
      if (blockText.startsWith('***') && selectionState.getStartOffset() === 3) {
        const updatedContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({ anchorOffset: 0 }),
          '',
          undefined,
          undefined
        );
        const newEditorState = RichUtils.toggleInlineStyle(
          EditorState.push(editorState, updatedContentState, 'remove-range'),
          'UNDERLINE'
        );
        setEditorState(newEditorState);
        return 'handled';
      }
    } else if (command === 'backspace') {
      const contentState = editorState.getCurrentContent();
      const selectionState = editorState.getSelection();
      const blockKey = selectionState.getStartKey();
      const block = contentState.getBlockForKey(blockKey);
      const blockText = block.getText();
      if (!blockText && selectionState.getStartOffset() === 0) {
        let newContentState = Modifier.replaceText(
          contentState,
          selectionState.merge({ anchorOffset: 0 }),
          '',
          undefined,
          undefined
        );
        newContentState = Modifier.setBlockType(newContentState, selectionState, 'unstyled');
        setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));

        const blockBefore = contentState.getBlockBefore(blockKey);
        if (blockBefore) {
          const keyOfBlockBefore = blockBefore.getKey();
          const lengthOfBlockBefore = blockBefore.getLength();

          const newSelection = new SelectionState({
            anchorKey: keyOfBlockBefore,
            anchorOffset: lengthOfBlockBefore,
            focusKey: keyOfBlockBefore,
            focusOffset: lengthOfBlockBefore,
          });

          const newEditorState = EditorState.forceSelection(editorState, newSelection);
          setEditorState(newEditorState);
        }
        return 'handled';
      }
    }
    return 'not-handled'; 
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 32 /* Space */) {
      const selection = editorState.getSelection();
      const contentState = editorState.getCurrentContent();
      const block = contentState.getBlockForKey(selection.getStartKey());
      const text = block.getText();
      if (text.startsWith('#') && selection.getStartOffset() === 1) {
        return 'add-heading';
      } else if (text.startsWith('*') && selection.getStartOffset() === 1) {
        return 'make-bold';
      } else if (text.startsWith('**') && selection.getStartOffset() === 2) {
        return 'make-red';
      } else if (text.startsWith('***') && selection.getStartOffset() === 3) {
        return 'add-underline';
      }
    }
    return getDefaultKeyBinding(e);
  };

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    localStorage.setItem('editorContent', JSON.stringify(rawContentState));
    alert('Content saved!');
  };


  const styleMap = {
    'COLOR-RED': {
      color: 'red',
    },
  };

  return (
    <div>
      <div className='header'>
        <h1 className='title'>Demo editor by Yogesh</h1>
        <button onClick={handleSave}>Save</button>
      </div>
      <div className='Editor-canvas'>
        <Editor
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            onChange={onChange}
            keyBindingFn={mapKeyToEditorCommand}
            textAlignment="left"
            customStyleMap={styleMap}
        />
      </div>
    </div>
  );
};

export default CustomEditor;
