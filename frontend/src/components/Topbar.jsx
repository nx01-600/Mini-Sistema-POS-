import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Dropdown, Menu, Button } from "antd";
import { DownOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";

export default function Topbar() {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().nombre || user.email || "Usuario");
        } else {
          setDisplayName(user.email || "Usuario");
        }
      } else {
        setDisplayName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <header
      className="fixed top-0 left-64 right-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 z-10"
      style={{ height: "64px" }}
    >
      <div className="flex-1 flex justify-end items-center gap-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 bg-gray-50"
          />
          <span className="absolute right-3 top-2 text-gray-400">
            <i className="fas fa-search"></i>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text" className="flex items-center gap-2">
              <UserOutlined className="text-xl" />
              <span className="text-gray-700 font-medium">{displayName}</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
