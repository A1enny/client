import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Dashboard.scss";
import Navbar from "../../Layout/Navbar/Navbar";
import Sidebar from "../../Layout/Sidebar/Sidebar";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const COLORS = ["#0088FE", "#FF8042"];

  const instance = axios.create({
    baseURL: "http://localhost:3002/api",
    timeout: 10000,
  });

  const fetchSummary = async () => {
    try {
      const { data } = await instance.get("/sales/summary");
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error.response?.data || error.message);
    }
  };

  const fetchPieData = async () => {
    try {
      const { data } = await instance.get("/sales/pie");
      setPieData(data);
    } catch (error) {
      console.error("Error fetching pie data:", error.response?.data || error.message);
    }
  };

  const fetchLineData = async () => {
    try {
      const { data } = await instance.get("/sales/line");
      setLineData(data);
    } catch (error) {
      console.error("Error fetching line data:", error.response?.data || error.message);
    }
  };

  const fetchBarData = async () => {
    try {
      const { data } = await instance.get("/sales/bar");
      setBarData(data);
    } catch (error) {
      console.error("Error fetching bar data:", error.response?.data || error.message);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const { data } = await instance.get("/products/top");
      setTopProducts(data);
    } catch (error) {
      console.error("Error fetching top products:", error.response?.data || error.message);
      setTopProducts([]); // ตั้งค่าว่างเพื่อไม่ให้แสดงข้อมูลผิดพลาดใน UI
    }
  };  

  useEffect(() => {
    fetchSummary();
    fetchPieData();
    fetchLineData();
    fetchBarData();
    fetchTopProducts();
  }, []);

  return (
    <div className="Navbar-container">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <div className="dashboardHeader">
            <h2>Sale Report / Overview</h2>
            <p>แมวมองร้านอาหารญี่ปุ่น</p>
          </div>

          <div className="infoCards">
            {[
              {
                title: "ยอดขายทั้งหมด",
                value: `${summary.total_sales || 0} บาท`,
                change: "+10.50%",
              },
              {
                title: "จำนวนลูกค้า",
                value: `${summary.total_customers || 0} ราย`,
                change: "+10.50%",
              },
              {
                title: "รายการสั่งซื้อ",
                value: `${summary.total_orders || 0} รายการ`,
                change: "+10.50%",
              },
              {
                title: "ยอดขายเฉลี่ยต่อคำสั่งซื้อ",
                value: `${summary.average_sales_per_order || 0} บาท`,
                change: "+10.50%",
              },
            ].map((card, index) => (
              <div className="card" key={index}>
                <h3>{card.title}</h3>
                <p>{card.value}</p>
                <small>เปรียบเทียบปีที่ผ่านมา: {card.change}</small>
              </div>
            ))}
          </div>

          <div className="charts">
            <div className="chartContainer">
              <h4>สัดส่วนยอดขาย</h4>
              <PieChart width={400} height={400}>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </div>

            <div className="chartContainer">
              <h4>ยอดขายรายเดือน</h4>
              <LineChart width={500} height={300} data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Online" stroke="#0088FE" />
                <Line type="monotone" dataKey="Offline" stroke="#FF8042" />
              </LineChart>
            </div>
          </div>

          <div className="dataTables">
            <div className="tableContainer">
              <h4>สินค้าขายดี</h4>
              <table>
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>จำนวนขาย</th>
                    <th>ยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.quantity_sold} รายการ</td>
                      <td>{product.total_sales} บาท</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="chartContainer">
              <h4>สัดส่วนแยกตามช่องทาง</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
