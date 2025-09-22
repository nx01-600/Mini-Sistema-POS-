import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Dropdown, Menu, Button, message } from "antd";
import { Badge, Popover, List, Spin } from "antd";
import { IoNotificationsSharp } from "react-icons/io5";
import { CloseOutlined } from "@ant-design/icons";
import { getUserNotifications, removeUserNotification } from "../utils/notifications";
import { getGlobalNotifications, removeGlobalNotification, canRemoveStockNotification } from "../utils/globalNotifications";
import { FaBox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { DownOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { FaUser, FaUserShield } from "react-icons/fa";

export default function Topbar() {
  const navigate = useNavigate();
  const [stockNotificaciones, setStockNotificaciones] = useState([]);
  const [stockPopoverVisible, setStockPopoverVisible] = useState(false);
  const [loadingStockNoti, setLoadingStockNoti] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [displayName, setDisplayName] = useState("");

  // useEffect para autenticación y datos del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", u.email));
        setRol(userDoc.exists() ? userDoc.data().rol : null);
        setDisplayName(userDoc.exists() ? (userDoc.data().nombre || u.email || "Usuario") : (u.email || "Usuario"));
      } else {
        setRol(null);
        setDisplayName("");
      }
    });
    return () => unsubscribe();
  }, []);

  // useEffect para notificaciones globales de stock 0
  useEffect(() => {
    let stockInterval;
    const fetchStockNotis = async () => {
      if (rol === "admin") {
        setLoadingStockNoti(true);
        setStockNotificaciones(await getGlobalNotifications());
        setLoadingStockNoti(false);
      }
    };
    if (rol === "admin") {
      fetchStockNotis();
      stockInterval = setInterval(fetchStockNotis, 5000);
    }
    return () => {
      if (stockInterval) clearInterval(stockInterval);
    };
  }, [rol]);

  useEffect(() => {
    let interval;
    if (user && user.email) {
      const fetchNotis = async () => {
        setLoadingNoti(true);
        setNotificaciones(await getUserNotifications(user.email));
        setLoadingNoti(false);
      };
      fetchNotis();
      interval = setInterval(fetchNotis, 5000);
      // Permite refrescar desde fuera (ej: después de compra)
      window.actualizarNotificaciones = fetchNotis;
    }
    return () => {
      clearInterval(interval);
      window.actualizarNotificaciones = null;
    };
  }, [user]);

  // Refresca notificaciones cada vez que se abre el popover
  const handlePopoverVisibleChange = async (visible) => {
    setPopoverVisible(visible);
    if (visible && user && user.email) {
      setLoadingNoti(true);
      setNotificaciones(await getUserNotifications(user.email));
      setLoadingNoti(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  // Maneja el intento de eliminar una notificación de stock
  const handleRemoveStockNotification = async (e, item) => {
    e.stopPropagation(); // Evitar navegación al hacer click en el botón
    
    // Verificar si se puede eliminar la notificación
    const canRemove = await canRemoveStockNotification(item.productoId);
    
    if (canRemove) {
      // Eliminar notificación y actualizar la lista
      await removeGlobalNotification(item.id);
      setStockNotificaciones(await getGlobalNotifications());
      message.success("Notificación eliminada correctamente");
    } else {
      // Mostrar mensaje detallado indicando las dos opciones para poder eliminar la notificación
      message.error({
        content: "No se puede eliminar la notificación mientras el producto tenga stock 0. Para eliminarla, debe rellenar el stock del producto o eliminar el producto completamente.",
        duration: 6, // Duración más larga para que el usuario pueda leer el mensaje completo
        style: { marginTop: '20px', maxWidth: '400px' }
      });
    }
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
  <div className="flex-1 flex justify-end items-center gap-2">
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
        {/* Notificaciones personales/compras */}
        <Popover
          placement="bottomRight"
          title={<span className="font-semibold text-blue-700">Notificaciones</span>}
          content={
            <div style={{ minWidth: 320, paddingRight: 8 }}>
              <List
                dataSource={notificaciones.sort((a, b) => b.fecha - a.fecha)}
                locale={{ emptyText: "Sin notificaciones" }}
                renderItem={item => (
                  <List.Item
                    style={{
                      background: '#f1f5ff',
                      borderRadius: 12,
                      marginBottom: 8,
                      border: '1px solid #c7d2fe',
                      padding: '14px 0 14px 22px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                    }}
                    actions={[
                      <Button
                        type="link"
                        icon={<CloseOutlined style={{ color: 'red' }} />}
                        onClick={async () => {
                          await removeUserNotification(user.email, item.id);
                          setNotificaciones(await getUserNotifications(user.email));
                        }}
                        style={{ marginLeft: 8, marginRight: 0 }}
                      >Quitar</Button>
                    ]}
                  >
                    <div style={{ flex: 1, textAlign: "left", fontSize: 15, color: "#333" }}>
                      <div className="font-medium text-blue-700" style={{ marginBottom: 2 }}>Compra exitosa</div>
                      <div className="text-xs text-gray-500" style={{ marginBottom: 2 }}>{new Date(item.fecha).toLocaleString()}</div>
                      <div className="text-sm text-gray-700">Productos: {item.productos.join(", ")}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          }
          trigger="click"
          open={popoverVisible}
          onOpenChange={handlePopoverVisibleChange}
        >
          <Badge count={notificaciones.length} size="small">
            <Button type="text" shape="circle" icon={<IoNotificationsSharp style={{ fontSize: 26, color: '#2563eb' }} />} />
          </Badge>
        </Popover>
        {/* Notificaciones de stock 0 solo para admins */}
        {rol === "admin" && (
          <Popover
            placement="bottomRight"
            title={<span className="font-semibold text-red-700">Stock agotado</span>}
            content={
              <div style={{ minWidth: 320, paddingRight: 8 }}>
                <List
                  dataSource={Object.values(stockNotificaciones).sort((a, b) => b.fecha - a.fecha)}
                  locale={{ emptyText: "Sin productos agotados" }}
                  renderItem={item => (
                    <List.Item
                      style={{
                        background: '#fee2e2',
                        borderRadius: 12,
                        marginBottom: 8,
                        border: '1px solid #dc2626',
                        padding: '14px 0 14px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/stock?search=${encodeURIComponent(item.nombre)}`)}
                      actions={[
                        <Button
                          type="link"
                          key="delete"
                          icon={<CloseOutlined style={{ color: 'red' }} />}
                          onClick={(e) => handleRemoveStockNotification(e, item)}
                          style={{ marginLeft: 8, marginRight: 0 }}
                          title="Borrar notificación (solo posible si hay stock o el producto fue eliminado)"
                        />
                      ]}
                    >
                      <div style={{ flex: 1, textAlign: "left", fontSize: 15, color: "#dc2626" }}>
                        <div className="font-medium text-red-700" style={{ marginBottom: 2 }}>Stock agotado</div>
                        <div className="text-xs text-gray-500" style={{ marginBottom: 2 }}>{new Date(item.fecha).toLocaleString()}</div>
                        <div className="text-sm text-red-700">Producto: {item.nombre}</div>
                        <div className="text-xs text-gray-500">Motivo: {item.motivo === "compra" ? "Por compra" : "Por edición"}</div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            }
            trigger="click"
            open={stockPopoverVisible}
            onOpenChange={setStockPopoverVisible}
          >
            <Badge count={Object.keys(stockNotificaciones).length} size="small">
              <Button type="text" shape="circle" icon={<FaBox style={{ fontSize: 24, color: '#dc2626' }} />} />
            </Badge>
          </Popover>
        )}
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text" className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                {rol === "admin" ? "Admin" : "Usuario"}
              </span>
              {rol === "admin" ? (
                <FaUserShield className="text-blue-600" title="Administrador" />
              ) : (
                <FaUser className="text-blue-400" title="Usuario" />
              )}
              <span className="text-gray-700 font-medium">{displayName}</span>
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
