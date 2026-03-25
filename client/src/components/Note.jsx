import { HighlightHTML } from "./HighlightHTML";
import "./Note.css";
import { Link, useLocation } from "react-router-dom";
import { Masonry, MasonryItem } from "./Masonry";
import PropTypes from "prop-types";
import { MultiLineShimmer, Shimmer } from "./Shimmer";
import { useFormatDate } from "../hook";

export function Note({ id, title, body, createdAt, highlightPattern }) {
  const location = useLocation();
  const formatDate = useFormatDate();
  return (
    <MasonryItem as="li" className="note">
      <div className="note--header">
        <h3 className="note--title">
          <Link
            to={`/note/${id}`}
            state={{
              backgroundLocation: location,
            }}
            className="note--link"
          >
            <HighlightHTML text={title} pattern={highlightPattern} />
          </Link>
        </h3>
        <time className="note--created-date">{formatDate(createdAt)}</time>
      </div>
      <div className="note--body">
        <HighlightHTML text={body} pattern={highlightPattern} />
      </div>
    </MasonryItem>
  );
}

Note.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  highlightPattern: PropTypes.string.isRequired,
};

export function NoteShimmer({ bodyLineCount }) {
  return (
    <MasonryItem as="li" className="note">
      <div className="note--header">
        <Shimmer>
          <h3 className="note--title">Title</h3>
        </Shimmer>
        <Shimmer>
          <time className="note--created-date">Date</time>
        </Shimmer>

        <MultiLineShimmer
          lineCount={bodyLineCount}
          renderItem={(index) => (
            <Shimmer key={index}>
              <p className="note--body">Body</p>
            </Shimmer>
          )}
        />
      </div>
    </MasonryItem>
  );
}

NoteShimmer.propTypes = {
  bodyLineCount: PropTypes.number.isRequired,
};

const noteListShimmerBodyLineCount = [1, 1, 2, 2, 3, 3].sort(
  () => 0.5 - Math.random()
);

export function NoteList({ list, isLoading, highlightPattern, emptyMessage }) {
  if (isLoading)
    return (
      <Masonry as="ul" className="note-list">
        {noteListShimmerBodyLineCount.map((value, index) => (
          <NoteShimmer key={index} bodyLineCount={value} />
        ))}
      </Masonry>
    );

  if (list.length === 0) {
    return <p className="note-empty">{emptyMessage}</p>;
  }

  return (
    <Masonry as="ul" className="note-list">
      {list.map(({ id, title, body, createdAt }) => (
        <Note
          key={id}
          id={id}
          title={title}
          body={body}
          createdAt={createdAt}
          highlightPattern={highlightPattern}
        />
      ))}
    </Masonry>
  );
}

NoteList.propTypes = {
  list: PropTypes.array.isRequired,
  highlightPattern: PropTypes.string.isRequired,
  emptyMessage: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
