import PropTypes from "prop-types";
import { useLoggedUser } from "../api";
import { Navigate } from "react-router-dom";

export function LoggedInGuard({ children }) {
  const { user, isLoading } = useLoggedUser();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" />;

  return children;
}

LoggedInGuard.propTypes = {
  children: PropTypes.node,
};

export function NotLoggedInGuard({ children }) {
  const { user, isLoading } = useLoggedUser();

  if (isLoading) return null;

  if (user) return <Navigate to="/" />;

  return children;
}

NotLoggedInGuard.propTypes = {
  children: PropTypes.node,
};
