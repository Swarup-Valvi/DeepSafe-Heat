import {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Alert,
    Box,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
  } from "@mui/material";
  
  import {
    getWeatherRecords,
  } from "../api/admin";
  
  
  function formatDate(value) {
    if (!value) return "—";
  
    return new Date(value)
      .toLocaleString("en-IN");
  }
  
  
  export default function WeatherDataPage() {
    const [records, setRecords] =
      useState([]);
  
    const [locationFilter, setLocationFilter] =
      useState("ALL");
  
    const [loading, setLoading] =
      useState(true);
  
    const [error, setError] =
      useState("");
  
  
    useEffect(() => {
      const load = async () => {
        try {
          setRecords(
            await getWeatherRecords()
          );
        } catch (err) {
          console.error(err);
  
          setError(
            "Unable to load weather records."
          );
        } finally {
          setLoading(false);
        }
      };
  
      load();
    }, []);
  
  
    const locations =
      useMemo(
        () => [
          ...new Set(
            records.map(
              (record) =>
                record.location
            )
          ),
        ],
        [records]
      );
  
  
    const filtered =
      locationFilter === "ALL"
        ? records
        : records.filter(
            (record) =>
              record.location ===
              locationFilter
          );
  
  
    return (
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Weather Data
        </Typography>
  
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Weather records used by
          HeatSafe risk assessments.
        </Typography>
  
  
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}
  
  
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            mb: 2,
          }}
        >
          <TextField
            select
            label="Location"
            value={locationFilter}
            onChange={(event) =>
              setLocationFilter(
                event.target.value
              )
            }
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="ALL">
              All locations
            </MenuItem>
  
            {locations.map(
              (location) => (
                <MenuItem
                  key={location}
                  value={location}
                >
                  {location}
                </MenuItem>
              )
            )}
          </TextField>
        </Paper>
  
  
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor:
                        "#FFF4EF",
                    }}
                  >
                    <TableCell>
                      Location
                    </TableCell>
                    <TableCell>
                      Time
                    </TableCell>
                    <TableCell>
                      Temp
                    </TableCell>
                    <TableCell>
                      Feels Like
                    </TableCell>
                    <TableCell>
                      Humidity
                    </TableCell>
                    <TableCell>
                      UV
                    </TableCell>
                    <TableCell>
                      Wind
                    </TableCell>
                    <TableCell>
                      Source
                    </TableCell>
                    <TableCell>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
  
                <TableBody>
                  {filtered.map(
                    (record) => (
                      <TableRow
                        key={record.id}
                        hover
                      >
                        <TableCell>
                          <Typography
                            fontWeight={750}
                          >
                            {
                              record.location
                            }
                          </Typography>
                        </TableCell>
  
                        <TableCell>
                          {formatDate(
                            record.recorded_at
                          )}
                        </TableCell>
  
                        <TableCell>
                          {
                            record.temperature
                          }
                          °C
                        </TableCell>
  
                        <TableCell>
                          {
                            record.feels_like
                          }
                          °C
                        </TableCell>
  
                        <TableCell>
                          {
                            record.humidity
                          }
                          %
                        </TableCell>
  
                        <TableCell>
                          {
                            record.uv_index
                          }
                        </TableCell>
  
                        <TableCell>
                          {
                            record.wind_speed
                          }{" "}
                          km/h
                        </TableCell>
  
                        <TableCell>
                          {record.source}
                        </TableCell>
  
                        <TableCell>
                          {record.status}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    );
  }