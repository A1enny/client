import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Dashboard/Dashboard.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
import PieChartComponent from "../Dashboard/piechart"; // นำเข้า Pie chart component ที่สร้างไว้
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [lineData, setLineData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          summaryRes,
          pieRes,
          lineRes,
          ordersRes,
          stockRes,
          topProductsRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/api/sales/summary`),
          axios.get(`${API_URL}/api/sales/pie`),
          axios.get(`${API_URL}/api/sales/line`),
          axios.get(`${API_URL}/api/orders/recent`),
          axios.get(`${API_URL}/api/inventory/low-stock`),
          axios.get(`${API_URL}/api/menus/top`),
        ]);

        console.log("recentOrders: ", ordersRes.data); // แก้ไขจาก recentRes เป็น ordersRes
        console.log("Summary Data: ", summaryRes.data); // Debugging summary data
        console.log("Pie Data:", pieRes.data); // ตรวจสอบข้อมูล Pie จาก API
        console.log("Low Stock Data: ", stockRes.data);

        setSummary(summaryRes.data);
        setLineData(lineRes.data);
        setRecentOrders(ordersRes.data);
        setLowStock(stockRes.data);
        setTopProducts(topProductsRes.data);
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
              {
                title: "ยอดขายวันนี้",
                value: summary.total_sales || 0,
                unit: "บาท",
              },
              {
                title: "รายการสั่งซื้อ",
                value: summary.total_orders || 0,
                unit: "รายการ",
              },
              {
                title: "ลูกค้าทั้งหมด",
                value: summary.total_customers || 0,
                unit: "ราย",
              },
              {
                title: "ยอดขายเฉลี่ย",
                value: summary.average_sales_per_order || 0,
                unit: "บาท",
              },
            ].map((card, index) => (
              <div className="card" key={index}>
                <h3>{card.title}</h3>
                <p>
                  {card.value} {card.unit}
                </p>
              </div>
            ))}
          </div>

          {/* 📊 กราฟข้อมูลยอดขาย */}
          <div className="charts">
            <div className="chartContainer">
              <h4>สัดส่วนยอดขาย</h4>
              <PieChartComponent />
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
                  <Line
                    type="monotone"
                    dataKey="total_sales"
                    stroke="#0088FE"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
                    <td>{order.table_number}</td>
                    {/* ตรวจสอบการแสดงรายการเมนู */}
                    <td>{order.recipe_name || "ไม่มีรายการ"}</td>
                    <td>{order.status}</td>
                    <td>{order.order_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 📌 สินค้าขายดี */}
          <div className="tableContainer">
            <h4>สินค้าขายดี</h4>
            <table>
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>จำนวนที่ขาย</th>
                  <th>ยอดขายรวม</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity_sold}</td>
                    <td>{product.total_sales}</td>
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
                    <td>{item.material_name}</td>
                    <td>{item.current_quantity}</td>
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
