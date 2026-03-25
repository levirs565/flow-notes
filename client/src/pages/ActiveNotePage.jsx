import { NoteList } from "../components/Note";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { useLocation, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useMemo } from "react";
import { useSearchQuery } from "./utils";
import { filterNotes } from "../utils";
import { useActiveNotes } from "../api";
import { useI8n } from "../provider/context";
import { LoggedInGuard } from "../guard/LoginGuard";

function ActiveNotePageContent({ location, searchQuery }) {
  const { notes, isLoading } = useActiveNotes();
  const filteredNotes = useMemo(
    () => (notes ? filterNotes(notes, searchQuery) : []),
    [searchQuery, notes]
  );
  const { getText } = useI8n();

  return (
    <main className="app-main">
      <NoteList
        list={filteredNotes}
        highlightPattern={searchQuery}
        emptyMessage={getText(
          searchQuery.length > 0
            ? "noteFindNotFoundMessage"
            : "noteBlankMessage"
        )}
        isLoading={isLoading}
      />
      <FloatingActionButton
        to="/note/add"
        state={{
          backgroundLocation: location,
        }}
      >
        +
      </FloatingActionButton>
    </main>
  );
}

ActiveNotePageContent.propTypes = {
  location: PropTypes.object.isRequired,
  searchQuery: PropTypes.string.isRequired,
};

function ActiveNotePage() {
  const { setShowSearch } = useOutletContext();
  const [searchQuery] = useSearchQuery();
  const location = useLocation();

  useEffect(() => {
    setShowSearch(true);

    return () => {
      setShowSearch(false);
    };
  });

  return (
    <ActiveNotePageContent location={location} searchQuery={searchQuery} />
  );
}

export function ActiveNotePageWrapper() {
  return (
    <LoggedInGuard>
      <ActiveNotePage />
    </LoggedInGuard>
  );
}
