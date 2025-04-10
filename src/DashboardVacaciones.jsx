import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Grid, Typography, TextField,
  MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper
} from "@mui/material";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

export default function DashboardVacaciones() {
  const [eventos, setEventos] = useState([]);
  const [filtroEmpleado, setFiltroEmpleado] = useState("Todos");

  const [nuevoEvento, setNuevoEvento] = useState({
    Nombre: "",
    Tipo: "Vacaciones",
    "Fecha inicio": "",
    "Fecha fin": "",
    Estado: "Pendiente"
  });

  const formURL = "https://docs.google.com/forms/d/e/1FAIpQLSdX-K_jY6BxDmxtASuN098lWkgoMqusOOXu1-oV1UhvsvfItg/formResponse";

  const cargarDatos = () => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSFsvnG7lS4h0jKjC9qkUgsdDOTePepPIAlO24R_q2Vxxv34TRq63japUcQ7tIxxcxDawJOSzcgI6gA/pub?gid=2049855241&single=true&output=csv")
      .then(response => response.text())
      .then(csv => {
        const lines = csv.split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map(line => {
          const values = line.split(",");
          const obj = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim();
          });
          return obj;
        }).filter(e => e.Nombre);
        setEventos(data);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const empleadosUnicos = ["Todos", ...new Set(eventos.map(e => e.Nombre))];

  const eventosFiltrados = filtroEmpleado === "Todos"
    ? eventos
    : eventos.filter(e => e.Nombre === filtroEmpleado);

  const manejarCambio = (campo, valor) => {
    setNuevoEvento({ ...nuevoEvento, [campo]: valor });
  };

  const enviarFormulario = async (evento) => {
    const formData = new FormData();
    formData.append("entry.1234567890", evento.Nombre);
    formData.append("entry.0987654321", evento.Tipo);
    formData.append("entry.1122334455", evento["Fecha inicio"]);
    formData.append("entry.5566778899", evento["Fecha fin"]);
    formData.append("entry.6677889900", evento.Estado);

    await fetch(formURL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });
  };

  const manejarEnvio = async () => {
    await enviarFormulario(nuevoEvento);
    alert("Solicitud enviada exitosamente.");
    setNuevoEvento({
      Nombre: "",
      Tipo: "Vacaciones",
      "Fecha inicio": "",
      "Fecha fin": "",
      Estado: "Pendiente"
    });
    setTimeout(() => {
      cargarDatos();
    }, 3000);
  };

  const cambiarEstado = async (evento, nuevoEstado) => {
    const actualizado = { ...evento, Estado: nuevoEstado };
    await enviarFormulario(actualizado);
    alert(`Estado cambiado a "${nuevoEstado}".`);
    setTimeout(() => {
      cargarDatos();
    }, 3000);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Calendario de Permisos</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Empleado</InputLabel>
                  <Select
                    value={filtroEmpleado}
                    label="Empleado"
                    onChange={e => setFiltroEmpleado(e.target.value)}
                  >
                    {empleadosUnicos.map(nombre => (
                      <MenuItem key={nombre} value={nombre}>{nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Calendar />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Solicitar Permiso</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField label="Nombre" value={nuevoEvento.Nombre} onChange={e => manejarCambio("Nombre", e.target.value)} />
                <FormControl>
                  <InputLabel>Tipo</InputLabel>
                  <Select value={nuevoEvento.Tipo} onChange={e => manejarCambio("Tipo", e.target.value)}>
                    <MenuItem value="Vacaciones">Vacaciones</MenuItem>
                    <MenuItem value="Permiso">Permiso</MenuItem>
                    <MenuItem value="Licencia médica">Licencia médica</MenuItem>
                  </Select>
                </FormControl>
                <TextField type="date" label="Fecha inicio" InputLabelProps={{ shrink: true }} value={nuevoEvento["Fecha inicio"]} onChange={e => manejarCambio("Fecha inicio", e.target.value)} />
                <TextField type="date" label="Fecha fin" InputLabelProps={{ shrink: true }} value={nuevoEvento["Fecha fin"]} onChange={e => manejarCambio("Fecha fin", e.target.value)} />
                <Button variant="contained" onClick={manejarEnvio}>Enviar Solicitud</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Eventos Registrados</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Empleado</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Inicio</TableCell>
                      <TableCell>Fin</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventosFiltrados.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell>{e.Nombre}</TableCell>
                        <TableCell>{e.Tipo}</TableCell>
                        <TableCell>{e["Fecha inicio"]}</TableCell>
                        <TableCell>{e["Fecha fin"]}</TableCell>
                        <TableCell>{e.Estado}</TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined" color="success" onClick={() => cambiarEstado(e, "Aprobado")} disabled={e.Estado === "Aprobado"}>Aprobar</Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => cambiarEstado(e, "Rechazado")} disabled={e.Estado === "Rechazado"}>Rechazar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
