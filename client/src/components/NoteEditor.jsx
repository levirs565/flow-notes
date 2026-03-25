import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ContentEditable, LimitedContentEditable } from "./ContentEditable";
import PropTypes from "prop-types";
import "./NoteEditor.css";
import { Shimmer } from "./Shimmer";
import { useI8n } from "../provider/context";

export function NoteTitleEditor({ editable, value, onValueChanged }) {
  const { getText } = useI8n();
  const [titleRemainingLength, setTitleRemainingLength] = useState();
  const maxTitleLength = 50;

  return (
    <div className="note-title-editor">
      <LimitedContentEditable
        as={"h2"}
        contentEditable={editable}
        className="note-title-editor--title"
        maxLength={maxTitleLength}
        placeholder={getText("noteTitlePlaceholder")}
        onRemainingLengthUpdated={(length) => setTitleRemainingLength(length)}
        value={value}
        onValueChanged={(e) => onValueChanged(e)}
      />
      <p
        className={`note-title-editor--remaining ${
          editable ? "note-title-editor--remaining--show" : ""
        }`}
      >
        {getText("remainingLength").replace("%", `${titleRemainingLength}`)}
      </p>
    </div>
  );
}

NoteTitleEditor.propTypes = {
  editable: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onValueChanged: PropTypes.func.isRequired,
};

export function NoteTitleEditorShimmer() {
  return (
    <Shimmer>
      <h2 className="note-title-editor">Title</h2>
    </Shimmer>
  );
}

export const NoteBodyEditor = forwardRef(function NoteBodyEditor(
  { editable, value, onValueChanged },
  ref
) {
  const { getText } = useI8n();
  const elementRef = useRef();
  useImperativeHandle(ref, () => {
    return {
      focus() {
        const range = document.createRange();
        range.selectNodeContents(elementRef.current);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        elementRef.current.focus();
      },
    };
  });
  return (
    <ContentEditable
      as={"div"}
      ref={elementRef}
      contentEditable={editable}
      className="note-body-editor"
      value={value}
      onValueChanged={(e) => onValueChanged(e)}
      placeholder={getText("noteBodyPlaceholder")}
    />
  );
});

NoteBodyEditor.propTypes = {
  editable: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onValueChanged: PropTypes.func.isRequired,
};

export function NoteBodyEditorShimmer() {
  return (
    <Shimmer>
      <p className="note-body--editor">Body</p>
    </Shimmer>
  );
}
