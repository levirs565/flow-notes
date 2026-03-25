import { useRef, useState } from "react";
import "./NoteAddDialog.css";
import { AppButton, AppButtonGroup } from "../components/AppButton";
import { useLocation } from "react-router-dom";
import {
  BaseDialog,
  BaseDialogFooter,
  BaseDialogForm,
  BaseDialogScrollable,
} from "./BaseDialog";
import { NoteBodyEditor, NoteTitleEditor } from "../components/NoteEditor";
import PropTypes from "prop-types";
import { useEnhancedNavigate } from "../routes";
import { useAddNote } from "../api";
import { useI8n } from "../provider/context";
import { LoggedInGuard } from "../guard/LoginGuard";

function NoteAddDialogContent({ open, onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { getText } = useI8n();

  return (
    <BaseDialog
      className={"note-add-dialog"}
      open={open}
      onCloseTransitionEnd={() => onClose()}
    >
      <BaseDialogForm>
        <BaseDialogScrollable>
          <NoteTitleEditor
            editable
            value={title}
            onValueChanged={(newTitle) => setTitle(newTitle)}
          />
          <NoteBodyEditor
            editable
            value={body}
            onValueChanged={(newBody) => setBody(newBody)}
          />
        </BaseDialogScrollable>
        <BaseDialogFooter>
          <AppButtonGroup>
            <AppButton>{getText("closeAction")}</AppButton>
            <AppButton
              disabled={title.length === 0}
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                onSubmit({
                  title,
                  body,
                });
              }}
            >
              {getText("saveAction")}
            </AppButton>
          </AppButtonGroup>
        </BaseDialogFooter>
      </BaseDialogForm>
    </BaseDialog>
  );
}

NoteAddDialogContent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

function NoteAddDialog() {
  const addNote = useAddNote();
  const { navigate, modalGoBack } = useEnhancedNavigate();
  const location = useLocation();
  const newNoteId = useRef();
  const [open, setOpen] = useState(true);

  return (
    <NoteAddDialogContent
      open={open}
      onClose={() => {
        if (newNoteId.current)
          navigate(`/note/${newNoteId.current}`, {
            replace: true,
            state: location.state,
          });
        else modalGoBack();
      }}
      onSubmit={(data) => {
        addNote(data).then((result) => {
          newNoteId.current = result.id;
          setOpen(false);
        });
      }}
    />
  );
}

export function NoteAddDialogWrapper() {
  return (
    <LoggedInGuard>
      <NoteAddDialog />
    </LoggedInGuard>
  );
}
