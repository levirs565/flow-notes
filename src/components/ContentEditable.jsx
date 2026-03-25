import { forwardRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./ContentEditable.css";
import { useImperativeHandle } from "react";

function getElementSelectionLength(el) {
  return document.activeElement == el
    ? (window.getSelection()?.toString().length ?? 0)
    : 0;
}

export const ContentEditable = forwardRef(function ContentEditable(
  { as, className, value, onValueChanged, ...props },
  ref,
) {
  const As = as;

  const innerRef = useRef();

  useImperativeHandle(ref, () => innerRef.current);

  useEffect(() => {
    if (!innerRef.current) return;
    innerRef.current.innerHTML = value;
  }, [value]);

  return (
    <As
      className={["content-editable", className].join(" ")}
      onBlur={(e) => onValueChanged(e.target.innerHTML)}
      ref={innerRef}
      {...props}
    />
  );
});

ContentEditable.propTypes = {
  as: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  onValueChanged: PropTypes.func.isRequired,
};

export function LimitedContentEditable({
  maxLength,
  onRemainingLengthUpdated,
  value,
  ...props
}) {
  const elementRef = useRef();
  const remainingLength = useRef();
  const updateRemainingLength = () => {
    remainingLength.current = maxLength - elementRef.current.innerText.length;
    onRemainingLengthUpdated(remainingLength.current);
  };

  useEffect(() => {
    updateRemainingLength();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <ContentEditable
      ref={elementRef}
      onInput={() => updateRemainingLength()}
      onKeyDown={(e) => {
        if (
          remainingLength.current <= 0 &&
          getElementSelectionLength(elementRef.current) == 0 &&
          ![
            "Backspace",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Delete",
          ].includes(e.code) &&
          !(
            e.ctrlKey &&
            ["KeyA", "KeyC", "KeyV", "KeyX", "KeyZ"].includes(e.code)
          )
        )
          e.preventDefault();
      }}
      onPaste={(e) => {
        const allowedPasteLength =
          remainingLength.current +
          getElementSelectionLength(elementRef.current);
        const text = e.clipboardData
          .getData("text/plain")
          .substring(0, allowedPasteLength);
        e.preventDefault();
        document.execCommand("insertHTML", false, text);
      }}
      value={value}
      {...props}
    />
  );
}

LimitedContentEditable.propTypes = {
  ...ContentEditable.propTypes,
  maxLength: PropTypes.number.isRequired,
  onRemainingLengthUpdated: PropTypes.func.isRequired,
};
