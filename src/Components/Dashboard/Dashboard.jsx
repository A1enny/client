import { useEffect, useState } from "react";
import axios from "axios";
import "../Dashboard/Dashboard.scss";
import Navbar from "../Layout/Navbar/Navbar";
import Sidebar from "../Layout/Sidebar/Sidebar";
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

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  const instance = axios.create({
    baseURL: "http://localhost:3002/api",
    timeout: 10000,
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const [summaryRes, pieRes, lineRes, barRes, topProductsRes] =
          await Promise.all([
            instance.get("/sales/summary"),
            instance.get("/sales/pie"),
            instance.get("/sales/line"),
            instance.get("/sales/bar"), // ✅ แก้ให้ตรงกับ backend
            instance.get("/sales/products/top"), // ✅ เปลี่ยน path ให้ตรง
          ]);

        setSummary(summaryRes.data);
        setPieData(pieRes.data);
        setLineData(lineRes.data);
        setBarData(barRes.data);
        setTopProducts(topProductsRes.data);
      } catch (error) {
        console.error(
          "Error fetching sales data:",
          error.response?.data || error.message
        );
      }
    };

    fetchSalesData();
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
                title: "ยอดขายเฉลี่ยต่อคำสั่งซื้อ",
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

          <div className="charts">
            <div className="chartContainer">
              <h4>สัดส่วนยอดขาย</h4>
              <PieChart width={400} height={400}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
              
            </div>

            <div className="chartContainer">
              <h4>ยอดขายรายเดือน</h4>
              <LineChart
                width={500}
                height={300}
                data={lineData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_sales" stroke="#0088FE" />
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
                  {topProducts.map((product, index) =>
                    product.name ? ( // ✅ ตรวจสอบว่าชื่อสินค้าไม่เป็นค่าว่าง
                      <tr key={index}>
                        <td>{product.name}</td>
                        <td>{product.quantity_sold} รายการ</td>
                        <td>{product.total_sales} บาท</td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>

            <div className="chartContainer">
              <h4>ยอดขายแยกตามช่องทาง</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#0088FE" />
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
