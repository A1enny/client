import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Dashboard/Dashboard.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, pieRes, lineRes, barRes, ordersRes, stockRes, reservationsRes, notificationsRes] =
          await Promise.all([
            axios.get(`${API_URL}/api/dashboard/sales/summary`),
            axios.get(`${API_URL}/api/dashboard/sales/pie`),
            axios.get(`${API_URL}/api/dashboard/sales/line`),
            axios.get(`${API_URL}/api/dashboard/sales/bar`),
            axios.get(`${API_URL}/api/dashboard/orders/recent`),
            axios.get(`${API_URL}/api/dashboard/inventory/low-stock`),
            axios.get(`${API_URL}/api/dashboard/reservations/upcoming`),
            axios.get(`${API_URL}/api/dashboard/notifications`),
          ]);

        setSummary(summaryRes.data);
        setPieData(pieRes.data);
        setLineData(lineRes.data);
        setBarData(barRes.data);
        setRecentOrders(ordersRes.data);
        setLowStock(stockRes.data);
        setReservations(reservationsRes.data);
        setNotifications(notificationsRes.data);
      } catch (error) {
        Swal.fire("❌ ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="Navbar-container">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div className="dashboardHeader">
            <h2>ภาพรวมร้านอาหาร</h2>
            <p>แมวมองร้านอาหารญี่ปุ่น</p>
          </div>

          {/* 📌 สรุปยอดขาย */}
          <div className="infoCards">
            {[
              { title: "ยอดขายวันนี้", value: summary.total_sales || 0, unit: "บาท" },
              { title: "รายการสั่งซื้อ", value: summary.total_orders || 0, unit: "รายการ" },
              { title: "ลูกค้าทั้งหมด", value: summary.total_customers || 0, unit: "ราย" },
              { title: "ยอดขายเฉลี่ย", value: summary.average_sales_per_order || 0, unit: "บาท" }
            ].map((card, index) => (
              <div className="card" key={index}>
                <h3>{card.title}</h3>
                <p>{card.value} {card.unit}</p>
              </div>
            ))}
          </div>

          {/* 📊 กราฟข้อมูลยอดขาย */}
          <div className="charts">
            <div className="chartContainer">
              <h4>สัดส่วนยอดขาย</h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chartContainer">
              <h4>ยอดขายรายเดือน</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_sales" stroke="#0088FE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 📊 กราฟยอดขายแยกตามช่องทาง */}
          <div className="chartContainer">
            <h4>ยอดขายแยกตามช่องทาง</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 📌 ออเดอร์ล่าสุด */}
          <div className="tableContainer">
            <h4>ออเดอร์ล่าสุด</h4>
            <table>
              <thead>
                <tr>
                  <th>โต๊ะ</th>
                  <th>รายการ</th>
                  <th>สถานะ</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.table}</td>
                    <td>{order.items}</td>
                    <td>{order.status}</td>
                    <td>{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📌 วัตถุดิบใกล้หมด */}
          <div className="tableContainer">
            <h4>วัตถุดิบใกล้หมด</h4>
            <table>
              <thead>
                <tr>
                  <th>วัตถุดิบ</th>
                  <th>ปริมาณคงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📌 การจองโต๊ะ */}
          <div className="tableContainer">
            <h4>การจองโต๊ะ</h4>
            <table>
              <thead>
                <tr>
                  <th>ลูกค้า</th>
                  <th>จำนวนที่นั่ง</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res, index) => (
                  <tr key={index}>
                    <td>{res.customer}</td>
                    <td>{res.seats}</td>
                    <td>{res.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
