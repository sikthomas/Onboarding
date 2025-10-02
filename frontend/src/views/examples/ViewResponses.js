import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "utils/authFetch";
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Spinner,
  Button,
  Input,
} from "reactstrap";
import Header from "components/Headers/Header.js";

// ✅ PDF, CSV, Excel export libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const ViewResponses = () => {
  const { id } = useParams(); // form id
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchResponses = async () => {
      try {
        const response = await authFetch(
          "http://127.0.0.1:8000/onboarding/submissions/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // ✅ Filter only responses for this form
        const filtered = data.filter((res) => res.form === parseInt(id));
        setResponses(filtered);
        setFilteredResponses(filtered);
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  // ✅ Search function
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = responses.filter((res) => {
      const dataStr = JSON.stringify(res.data).toLowerCase();
      return dataStr.includes(value);
    });

    setFilteredResponses(filtered);
    setCurrentPage(1);
  };

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredResponses.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentResponses = filteredResponses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (direction) => {
    if (direction === "prev" && currentPage > 1)
      setCurrentPage(currentPage - 1);
    if (direction === "next" && currentPage < totalPages)
      setCurrentPage(currentPage + 1);
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Form #${id} Responses`, 14, 15);

    const firstData = responses[0].data;
    const headers = Object.keys(firstData);
    const tableColumn = [...headers, "File Upload", "Submitted At"];

    const tableRows = filteredResponses.map((res) => [
      ...headers.map((key) => res.data[key] || "-"),
      res.file_upload || "-",
      new Date(res.created_at).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(`form_${id}_responses.pdf`);
  };

  // ✅ Export to CSV
  const exportToCSV = () => {
    const csvData = filteredResponses.map((res) => ({
      ...res.data,
      file_upload: res.file_upload || "-",
      created_at: new Date(res.created_at).toLocaleString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `form_${id}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    const wsData = filteredResponses.map((res) => ({
      ...res.data,
      file_upload: res.file_upload || "-",
      created_at: new Date(res.created_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
    XLSX.writeFile(workbook, `form_${id}_responses.xlsx`);
  };

  if (loading) {
    return (
      <Container className="mt-7 text-center">
        <Spinner color="primary" />
      </Container>
    );
  }

  if (responses.length === 0) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Card className="shadow text-center p-5">
            <h3>No responses found for this form.</h3>
          </Card>
        </Container>
      </>
    );
  }

  // ✅ Extract table headers from the first response's keys
  const firstData = responses[0].data;
  const headers = Object.keys(firstData);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <h3 className="mb-0">RESPONSES</h3>

                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Input
                    type="text"
                    placeholder="🔍 Search responses..."
                    value={searchQuery}
                    onChange={handleSearch}
                    style={{ width: "500px" }}
                  />
                  <Button color="success" size="sm" onClick={exportToPDF} style={{ marginLeft: "100px" }}>
                    📄 PDF
                  </Button>
                  <Button color="info" size="sm" onClick={exportToExcel}>
                    📘 Excel
                  </Button>
                  <Button color="primary" size="sm" onClick={exportToCSV}>
                    📄 CSV
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => window.history.back()}
                  >
                    ← Back
                  </Button>
                </div>
              </CardHeader>

              <CardBody>
                <Table
                  className="align-items-center table-flush"
                  responsive
                  bordered
                >
                  <thead className="thead-light">
                    <tr>
                      <th>#</th>
                      {headers.map((key, index) => (
                        <th key={index}>{key}</th>
                      ))}
                      <th>File Upload</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResponses.map((res, index) => (
                      <tr key={res.id}>
                        <td>{indexOfFirstItem + index + 1}</td>

                        {headers.map((key) => (
                          <td key={key}>{res.data[key] || "-"}</td>
                        ))}

                        <td>
                          {res.file_upload ? (
                            <a
                              href={res.file_upload}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#007bff",
                                textDecoration: "underline",
                              }}
                            >
                              View File
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td>
                          {new Date(res.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* ✅ Pagination controls (bottom) */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      color="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange("prev")}
                    >
                      ← Previous
                    </Button>

                    <span>
                      Page <strong>{currentPage}</strong> of{" "}
                      <strong>{totalPages}</strong>
                    </span>

                    <Button
                      color="secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange("next")}
                    >
                      Next →
                    </Button>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <label className="mb-0">Rows per page:</label>
                    <Input
                      type="select"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{ width: "80px" }}
                    >
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Input>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default ViewResponses;
