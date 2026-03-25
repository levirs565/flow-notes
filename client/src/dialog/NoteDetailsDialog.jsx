import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "./NoteDetailsDialog.css";
import {
  AppButton,
  AppButtonGroup,
  AppButtonGroupSpacer,
} from "../components/AppButton";
import {
  BaseDialog,
  BaseDialogScrollable,
  BaseDialogFooter,
  BaseDialogForm,
  BaseDialogTitle,
} from "./BaseDialog";
import {
  NoteBodyEditor,
  NoteBodyEditorShimmer,
  NoteTitleEditor,
  NoteTitleEditorShimmer,
} from "../components/NoteEditor";
import PropTypes from "prop-types";
import { useEnhancedNavigate } from "../routes";
import { useAddNote, useNote } from "../api";
import { MultiLineShimmer, Shimmer } from "../components/Shimmer";
import { useI8n } from "../provider/context";
import { useFormatDate } from "../hook";
import { LoggedInGuard } from "../guard/LoginGuard";

function NoteDetailsDialogSuccessForm({
  title,
  body,
  createdAt,
  archived,
  onDelete,
  onChangeArchive,
  onTitleChanged,
  onBodyChanged,
  onSave,
}) {
  const [editable, setEditable] = useState(false);
  const bodyRef = useRef();
  const { getText } = useI8n();
  const formatDate = useFormatDate();

  return (
    <BaseDialogForm>
      <BaseDialogScrollable>
        <NoteTitleEditor
          editable={editable}
          value={title}
          onValueChanged={(newTitle) => onTitleChanged(newTitle)}
        />
        <time className="note-details-dialog--created-date">
          {formatDate(createdAt)}
        </time>
        <NoteBodyEditor
          ref={bodyRef}
          editable={editable}
          value={body}
          onValueChanged={(newBody) => onBodyChanged(newBody)}
        />
      </BaseDialogScrollable>
      <BaseDialogFooter>
        <AppButtonGroup>
          {editable ? (
            <AppButton
              onClick={(e) => {
                e.preventDefault();
                setEditable(false);
                onSave();
              }}
            >
              {getText("saveAction")}
            </AppButton>
          ) : (
            <AppButton
              onClick={(e) => {
                e.preventDefault();
                setEditable(true);
                setTimeout(() => {
                  bodyRef.current.focus();
                }, 100);
              }}
            >
              {getText("editAction")}
            </AppButton>
          )}
          <AppButton
            onClick={(e) => {
              e.preventDefault();
              onChangeArchive(!archived);
            }}
          >
            {getText(archived ? "unarchiveAction" : "archiveAction")}
          </AppButton>
          <AppButton
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            variant="danger"
          >
            {getText("deleteAction")}
          </AppButton>
          <AppButtonGroupSpacer />
          <AppButton>{getText("closeAction")}</AppButton>
        </AppButtonGroup>
      </BaseDialogFooter>
    </BaseDialogForm>
  );
}

NoteDetailsDialogSuccessForm.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  archived: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTitleChanged: PropTypes.func.isRequired,
  onBodyChanged: PropTypes.func.isRequired,
  onChangeArchive: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function NoteDetailsDialogNotFoundForm({ onCreateNew }) {
  const { getText } = useI8n();
  return (
    <BaseDialogForm>
      <BaseDialogScrollable>
        <BaseDialogTitle>{getText("noteNotFoundMessage")}</BaseDialogTitle>
      </BaseDialogScrollable>
      <BaseDialogFooter>
        <AppButtonGroup>
          <AppButtonGroupSpacer />
          <AppButton>{getText("closeAction")}</AppButton>
          <AppButton
            variant="primary"
            onClick={(e) => {
              e.preventDefault();
              onCreateNew();
            }}
          >
            {getText("createNewAction")}
          </AppButton>
        </AppButtonGroup>
      </BaseDialogFooter>
    </BaseDialogForm>
  );
}

NoteDetailsDialogNotFoundForm.propTypes = {
  onCreateNew: PropTypes.func.isRequired,
};

function NoteDetailsDialogLoadingForm() {
  return (
    <BaseDialogForm>
      <BaseDialogScrollable>
        <NoteTitleEditorShimmer />
        <Shimmer>
          <time className="note-details-dialog--created-date">Waktu</time>
        </Shimmer>
        <MultiLineShimmer
          lineCount={3}
          renderItem={(index) => <NoteBodyEditorShimmer key={index} />}
        />
      </BaseDialogScrollable>
      <BaseDialogFooter>
        <AppButtonGroup>
          <Shimmer>
            <AppButton>Simpan</AppButton>
            <AppButton>Arsipkan</AppButton>
            <AppButton>Hapus</AppButton>
          </Shimmer>
          <AppButtonGroupSpacer />
          <Shimmer>
            <AppButton>Keluar</AppButton>
          </Shimmer>
        </AppButtonGroup>
      </BaseDialogFooter>
    </BaseDialogForm>
  );
}

function NoteDetailsDialogContent({
  open,
  note: rawNote,
  isLoading,
  onClose,
  onChangeArchive,
  onDelete,
  onSave,
  onCreateNew,
}) {
  const [note, setNote] = useState();

  useEffect(() => {
    setNote(rawNote);
  }, [rawNote]);

  return (
    <BaseDialog
      open={open}
      className="note-details-dialog"
      onCloseTransitionEnd={onClose}
    >
      {isLoading ? (
        <NoteDetailsDialogLoadingForm />
      ) : note ? (
        <NoteDetailsDialogSuccessForm
          archived={note.archived}
          body={note.body}
          createdAt={note.createdAt}
          title={note.title}
          onTitleChanged={(newTitle) =>
            setNote((note) => ({ ...note, title: newTitle }))
          }
          onBodyChanged={(newBody) =>
            setNote((note) => ({
              ...note,
              body: newBody,
            }))
          }
          onChangeArchive={(newArchived) => {
            setNote((note) => ({
              ...note,
              archived: newArchived,
            }));
            onChangeArchive(newArchived);
          }}
          onDelete={onDelete}
          onSave={() => onSave(note)}
        />
      ) : (
        <NoteDetailsDialogNotFoundForm onCreateNew={onCreateNew} />
      )}
    </BaseDialog>
  );
}

NoteDetailsDialogContent.propTypes = {
  open: PropTypes.bool.isRequired,
  note: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChangeArchive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCreateNew: PropTypes.func.isRequired,
};

function NoteDetailsDialog() {
  const location = useLocation();
  const { id } = useParams();
  const { navigate, modalGoBack } = useEnhancedNavigate();
  const { note, isLoading, archive, unarchive, remove } = useNote(id);
  const addNote = useAddNote();
  const [open, setOpen] = useState(true);

  return (
    <NoteDetailsDialogContent
      isLoading={isLoading}
      open={open}
      note={note}
      onClose={modalGoBack}
      onDelete={() => {
        remove().then(() => {
          setOpen(false);
        });
      }}
      onChangeArchive={async (state) => {
        if (state) await archive();
        else unarchive();
      }}
      onSave={({ body, title }) => {
        // Api untuk mengedit catatan tidak ada
        // edit = delete + add
        addNote({ body, title }).then((newNote) => {
          navigate(`/note/${newNote.id}`, {
            state: location.state,
            replace: true,
          });
          remove();
        });
      }}
      onCreateNew={() => {
        navigate(
          {
            pathname: "/note/add",
          },
          {
            state: location.state,
            replace: true,
          }
        );
      }}
    />
  );
}

export function NoteDetailsDialogWrapper() {
  return (
    <LoggedInGuard>
      <NoteDetailsDialog />
    </LoggedInGuard>
  );
}
