import { createContext, useState, useEffect } from "react";
import { API } from "../service/api";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
} from "../utils/common-utils";

export const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  const [account, setAccount] = useState(() => {
    // Try to get the stored account data from sessionStorage
    const storedAccount = sessionStorage.getItem("account");
    return storedAccount
      ? JSON.parse(storedAccount)
      : { name: "", username: "" };
  });

  useEffect(() => {
    // Store account data in sessionStorage whenever it changes
    if (account.username) {
      sessionStorage.setItem("account", JSON.stringify(account));
      // Verify token is still valid
      const token = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!token && !refreshToken) {
        logout();
      }
    } else {
      sessionStorage.removeItem("account");
    }
  }, [account]);

  const logout = () => {
    sessionStorage.clear();
    setAccessToken("");
    setAccount({ name: "", username: "" });
  };

  return (
    <DataContext.Provider
      value={{
        account,
        setAccount,
        logout,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
