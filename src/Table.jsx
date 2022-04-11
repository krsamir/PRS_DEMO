import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "./App.css";
export default function Table() {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef(null);
  const [open, setOpen] = React.useState(false);
  const [isEdit, setEdit] = React.useState(false);
  const [data, setData] = useState([
    { make: "", model: "", price: "", id: "" },
  ]);
  useEffect(() => {
    axios
      .get("http://localhost:5000/getData")
      .then((res) => {
        console.log(res.data.data);
        setRowData(res.data.data);
      })
      .catch((e) => console.log(e));
  }, []);

  const fetchData = async () => {
    await axios
      .get("http://localhost:5000/getData")
      .then((res) => {
        console.log(res.data.data);
        setRowData(res.data.data);
      })
      .catch((e) => console.log(e));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setData([{ make: "", model: "", price: "", id: "" }]);
    setEdit(false);
  };

  const [selectedData, setSelectedData] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  const columnDefs = [
    {
      field: "make",
      sortable: true,
      filter: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    { field: "model", sortable: true, filter: true },
    { field: "price", sortable: true, filter: true },
  ];

  const onGridReady = (e) => {
    e.api.sizeColumnsToFit();
    setGridApi(e.api);
  };

  const onSelectionChanged = (e) => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedDatas = selectedNodes.map((node) => node.data);
    setSelectedData(selectedDatas);
    return selectedData;
  };

  const handleChange = (e, index) => {
    const parsedData = [...data];
    parsedData[index][e.target.name] = e.target.value;
    setData(parsedData);
  };
  const addItem = () => {
    const parsedData = [...data];
    parsedData.push({ make: "", model: "", price: "", id: "" });
    setData(parsedData);
  };

  const handleSave = async () => {
    await axios
      .post("http://localhost:5000/addData", data)
      .then((res) => {
        console.log(res.data);
        gridApi.applyTransaction({ add: [res.data] });
        // fetchData();
      })
      .catch((e) => console.log(e));
    console.log(data);
    // client side data entry
    // optimised api call - not to again call data for feeding data
    handleClose();
    setEdit(false);
    // need to make server api call for saving
  };
  const handleSaveUpdate = () => {
    console.log(data);
    // client side data entry
    // optimised api call - not to again call data for feeding data
    gridApi.applyTransaction({ update: data });
    handleClose();
    setEdit(false);
    // need to make server api call for saving
  };
  const beforeClose = () => {
    setEdit(false);
    handleClose();
    setData([{ make: "", model: "", price: "", id: "" }]);
  };

  const handleUpdate = () => {
    setEdit(true);
    setData(selectedData);
    handleClickOpen();
  };
  const addMenu = (
    <Dialog open={open} onClose={beforeClose}>
      <DialogTitle>
        <div className="horizontal">
          <div className="left">{isEdit ? "Update" : "Create"}</div>
          <div className="right">
            <IconButton onClick={addItem}>
              <AddIcon />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"div"}>
          <div style={{ marginTop: "10px" }}>
            {data.map(({ make, model, price, id }, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                style={{ marginBottom: "10px" }}
              >
                <Grid item xs={4}>
                  <TextField
                    id="outlined-basic"
                    label="Make"
                    variant="outlined"
                    value={make}
                    name="make"
                    onChange={(e) => handleChange(e, index)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="outlined-basic"
                    label="Model"
                    variant="outlined"
                    value={model}
                    name="model"
                    onChange={(e) => handleChange(e, index)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    id="outlined-basic"
                    label="Price"
                    variant="outlined"
                    value={price}
                    name="price"
                    onChange={(e) => handleChange(e, index)}
                  />
                </Grid>
              </Grid>
            ))}
          </div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {isEdit ? (
          <Button onClick={handleSaveUpdate}>update</Button>
        ) : (
          <Button onClick={handleSave}>create</Button>
        )}
      </DialogActions>
    </Dialog>
  );
  const [openDelete, setOpenDelete] = React.useState(false);
  const handleClickOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setSelectedData([]);
    gridApi.deselectAll();
    setOpenDelete(false);
  };
  const beforeDelete = () => {
    gridApi.deselectAll();
    setSelectedData([]);
    handleCloseDelete();
  };
  const handleDelete = () => {
    gridApi.applyTransaction({ remove: selectedData });
    gridApi.deselectAll();
    handleCloseDelete();
  };
  const deleteMenu = (
    <Dialog
      open={openDelete}
      onClose={beforeDelete}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Delete</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete :{" "}
          {selectedData.map((node) => `${node.model}`).join(", ")}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDelete}>cancel</Button>
        <Button onClick={handleDelete} autoFocus>
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  );
  const getRowId = (params) => params.data.id;
  return (
    <div>
      <div
        className="ag-theme-alpine"
        style={{ height: "500px", width: "100%" }}
      >
        {/* <button onClick={onButtonClick}>Get selected rows</button> */}
        <div className="hor uppercol">
          <Button className="" variant="outlined" fullWidth>
            Predict
          </Button>
          <Button className="btns" variant="outlined" fullWidth>
            Analytics View
          </Button>
          <Button className="btns" variant="outlined" fullWidth>
            Advance Search
          </Button>
          <TextField
            className="btns"
            id="outlined-basic"
            label="Search Customer Id"
            variant="outlined"
            size="small"
            autoFocus
            onChange={(e) => gridApi.setQuickFilter(e.target.value)}
            fullWidth
          />
          <Button
            className="btns"
            variant="outlined"
            onClick={handleClickOpen}
            fullWidth
          >
            Add
          </Button>
          <Button
            className="btns"
            variant="outlined"
            onClick={handleUpdate}
            disabled={selectedData.length === 0}
            fullWidth
          >
            Edit
          </Button>
          <Button
            className="btns"
            variant="outlined"
            onClick={handleClickOpenDelete}
            disabled={selectedData.length === 0}
            fullWidth
          >
            Delete
          </Button>
        </div>
        <AgGridReact
          ref={gridRef}
          getRowId={getRowId}
          onGridReady={onGridReady}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection="multiple"
          pagination={true}
          onSelectionChanged={onSelectionChanged}
          animateRows={true}
        ></AgGridReact>
      </div>
      {addMenu}
      {deleteMenu}
    </div>
  );
}
