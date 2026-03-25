import { useEffect } from "react";
import { useRef } from "react";
import PropTypes from "prop-types";
import "./BaseDialog.css";

export function BaseDialog({
  open,
  className,
  onClose,
  children,
  onCloseTransitionEnd,
}) {
  const dialogRef = useRef();

  useEffect(() => {
    if (dialogRef.current)
      setTimeout(() => {
        if (open) dialogRef.current.showModal();
        else dialogRef.current.close();
      }, 1);
  }, [open]);

  return (
    <dialog
      className={["base-dialog", className].join(" ")}
      ref={dialogRef}
      onClose={(e) => {
        if (onClose) onClose();

        const callback = () => {
          if (onCloseTransitionEnd) onCloseTransitionEnd();
        };
        Promise.all(
          e.target.getAnimations().map((animation) => animation.finished)
        )
          .then(callback)
          .catch(callback);
      }}
    >
      {children}
    </dialog>
  );
}

BaseDialog.propTypes = {
  open: PropTypes.bool,
  className: PropTypes.string,
  onClose: PropTypes.func,
  children: PropTypes.node,
  onCloseTransitionEnd: PropTypes.func,
};

export function BaseDialogForm({ children }) {
  return (
    <form className="base-dialog--form" method="dialog">
      {children}
    </form>
  );
}

BaseDialogForm.propTypes = {
  children: PropTypes.node,
};

export function BaseDialogScrollable({ children }) {
  return <div className="base-dialog--scroll">{children}</div>;
}

BaseDialogScrollable.propTypes = {
  children: PropTypes.node,
};

export function BaseDialogFooter({ children }) {
  return <div className="base-dialog--footer">{children}</div>;
}

BaseDialogFooter.propTypes = {
  children: PropTypes.node,
};

export function BaseDialogTitle({ children }) {
  return <h2 className="base-dialog--title">{children}</h2>;
}

BaseDialogTitle.propTypes = {
  children: PropTypes.node,
};
