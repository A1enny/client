import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF5733"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SalesPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/sales/pie`);
        const formattedData = response.data.map((item) => ({
          name: item.name,
          value: parseFloat(item.value),
        }));
        setData(formattedData);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลขาย:", error);
      }
    };

    fetchSalesData();
  }, []);

  return (
    <ResponsiveContainer width="80%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"  // ปรับ PieChart ไปทางซ้ายเล็กน้อย
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={130}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        {/* ✅ Legend ด้านขวา เรียงจากบนลงล่าง */}
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
