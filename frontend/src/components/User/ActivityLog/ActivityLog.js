import React from "react";

import "./ActivityLog.css";
import { Container, Row, Col, Input, Label, Table } from "reactstrap";
import { IoMdSearch } from "react-icons/io";
import { RiFileExcel2Fill } from "react-icons/ri";

import http from "../../../utils/http";
import dateFormatter from "../../../utils/dateFormatter";
import csv from "../../../utils/csv";

import { withTranslation } from "react-i18next";

class ActivityLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lsActivity: [],
      dateFrom: new Date(new Date().setHours(0, 0, 0, 0)),
      dateTo: new Date(),
      isSortByTimestampAsc: false,
      searchText: this.props.location.username
        ? this.props.location.username
        : "",
      lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
    };

    this.handleChangeDateTo = this.handleChangeDateTo.bind(this);
    this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.toggleSortByTimestamp = this.toggleSortByTimestamp.bind(this);
    this.getActivity = this.getActivity.bind(this);
    this.exportTable = this.exportTable.bind(this);
  }

  componentDidMount() {
    this.getActivity();
  }

  async getActivity() {
    try {
      let { dateFrom, dateTo } = this.state;
      let payload = {
        from: dateFrom,
        to: dateTo,
      };

      let resp = await http.post("/activity/", payload);

      this.setState({ lsActivity: resp.data });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  handleChangeDateFrom(e) {
    let { dateTo } = this.state;
    let dateFrom = e.target.value;

    if (new Date(dateFrom).getTime() > new Date(dateTo).getTime()) {
      alert("Date From must be before date To.");
      return;
    }

    this.setState({
      dateFrom: dateFrom,
    });
  }

  handleChangeDateTo(e) {
    let { dateFrom } = this.state;
    let dateTo = e.target.value;

    if (new Date(dateFrom).getTime() > new Date(dateTo).getTime()) {
      alert("Date To must be after date From.");
      return;
    }

    this.setState({
      dateTo: dateTo,
    });
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  toggleSortByTimestamp() {
    this.setState((prevState) => ({
      isSortByTimestampAsc: !prevState.isSortByTimestampAsc,
    }));
  }

  exportTable() {
    let rows = [];
    let tableRows = document.querySelectorAll("table tr");

    for (let i = 0; i < tableRows.length; i++) {
      let row = [];
      let cols = tableRows[i].querySelectorAll("td, th");

      for (let j = 0; j < cols.length; j++) {
        row.push(cols[j].innerText);
      }

      rows.push(row);
    }

    csv.exportFile("Activity Log", rows);
  }

  render() {
    let {
      lsActivity,
      dateFrom,
      dateTo,
      searchText,
      isSortByTimestampAsc,
      lsPermission,
    } = this.state;

    const { t } = this.props;

    let lsActivityDisplay = lsActivity.slice();

    if (isSortByTimestampAsc) {
      lsActivityDisplay.sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      );
    } else {
      lsActivityDisplay.sort(
        (a, b) =>
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
    }

    if (searchText.length > 0) {
      lsActivityDisplay = lsActivityDisplay.filter((activity) => {
        return (
          activity.username.includes(searchText) ||
          t(activity.user_type).includes(searchText) ||
          t(activity.action).includes(searchText) ||
          dateFormatter
            .ddmmyyyyhhmm(new Date(activity.datetime))
            .includes(searchText)
        );
      });
    }

    return (
      <div className="activity-log">
        <Row className="row-heading">
          <Col sm={3} className="col-heading">
            {t("Activity Log")}
          </Col>
          <Col sm={1} className="col-excel-icon">
            {lsPermission.find((p) => p.label === "Export Information") ? (
              <RiFileExcel2Fill
                className="icon-excel"
                size={25}
                onClick={this.exportTable}
              />
            ) : (
              <></>
            )}
          </Col>
          <Col sm={8}></Col>
        </Row>
        <Container className="container-table-activity-log">
          <Row className="row-input">
            <div row className="row-fg-period">
              <Label for="dateFrom" sm={1}>
                {t("From")}
              </Label>
              <Col sm={3} className="col-input">
                <Input
                  className="datepicker"
                  type="datetime-local"
                  name="dateFrom"
                  id="dateFrom"
                  placeholder="datetime placeholder"
                  value={dateFormatter.toDateTimeString(dateFrom)}
                  onChange={this.handleChangeDateFrom}
                  max={dateFormatter.toDateTimeString(dateTo)}
                />
              </Col>
              <Label for="dateTo" sm={1}>
                {t("To")}
              </Label>
              <Col sm={3} className="col-input">
                <Input
                  className="datepicker"
                  type="datetime-local"
                  name="dateTo"
                  id="dateTo"
                  placeholder="datetime placeholder"
                  value={dateFormatter.toDateTimeString(dateTo)}
                  onChange={this.handleChangeDateTo}
                  min={dateFormatter.toDateTimeString(dateFrom)}
                />
              </Col>
              <button className="btn-apply" onClick={this.getActivity}>
                {t("Apply")}
              </button>
              <Input
                type="text"
                name="searchText"
                id="searchText"
                value={searchText}
                onChange={this.handleInputChange}
              />
              <span className="search-icon">
                <IoMdSearch size={25} />
              </span>
            </div>
          </Row>
          <Table className="table-activity-log">
            <thead>
              <tr>
                <th
                  className={isSortByTimestampAsc ? "sort_asc" : "sort_desc"}
                  onClick={this.toggleSortByTimestamp}
                >
                  {t("Datetime")}
                </th>
                <th>{t("Username")}</th>
                <th>{t("User Type")}</th>
                <th>{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {lsActivityDisplay.map((act) => (
                <tr>
                  <td>
                    {dateFormatter.ddmmyyyyhhmm_noOffset(
                      new Date(act.datetime)
                    )}
                  </td>
                  <td>{act.username}</td>
                  <td>{t(act.user_type)}</td>
                  <td>{t(act.action)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default withTranslation()(ActivityLog);
