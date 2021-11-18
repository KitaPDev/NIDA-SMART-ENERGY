import React from "react";

import "./UserManagement.css";
import { Container, Row, Table, Form, FormGroup, Input } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";

import http from "../../../utils/http";
import dateFormatter from "../../../utils/dateFormatter";
import csv from "../../../utils/csv";

import { withTranslation } from "react-i18next";

class UserManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lsUser: [],
      isSortByUsernameAsc: false,
      isSortByUsernameDesc: false,
      isSortByDateActivatedAsc: false,
      isSortByDateActivatedDesc: false,
      isSortByDateLastLoginAsc: false,
      isSortByDateLastLoginDesc: false,
      searchText: "",
      lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
    };

    this.getAllUser = this.getAllUser.bind(this);
    this.toggleSortByUsername = this.toggleSortByUsername.bind(this);
    this.toggleSortByActivatedDate = this.toggleSortByActivatedDate.bind(this);
    this.toggleSortByLastLoginDate = this.toggleSortByLastLoginDate.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.navigateToUserProfile = this.navigateToUserProfile.bind(this);
    this.navigateToActivityLog = this.navigateToActivityLog.bind(this);
    this.exportTable = this.exportTable.bind(this);
  }

  componentDidMount() {
    this.getAllUser();
  }

  async getAllUser() {
    try {
      let resp = await http.get("/user/all");

      this.setState({ lsUser: resp.data });
    } catch (err) {
      console.log(err);
      alert("Unable to activate. Please try again.");
      return err.response;
    }
  }

  toggleSortByUsername() {
    let { isSortByUsernameAsc, isSortByUsernameDesc } = this.state;

    if (!(isSortByUsernameAsc || isSortByUsernameDesc)) {
      this.setState({
        isSortByUsernameAsc: true,
        isSortByDateActivatedAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    } else if (isSortByUsernameAsc) {
      this.setState({
        isSortByUsernameDesc: true,
        isSortByUsernameAsc: false,
        isSortByDateActivatedAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    } else if (isSortByUsernameDesc) {
      this.setState({
        isSortByUsernameAsc: true,
        isSortByUsernameDesc: false,
        isSortByDateActivatedAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    }
  }

  toggleSortByActivatedDate() {
    let { isSortByDateActivatedAsc, isSortByDateActivatedDesc } = this.state;

    if (!(isSortByDateActivatedAsc || isSortByDateActivatedDesc)) {
      this.setState({
        isSortByDateActivatedAsc: true,
        isSortByDateActivatedDesc: false,
        isSortByUsernameDesc: false,
        isSortByUsernameAsc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    } else if (isSortByDateActivatedAsc) {
      this.setState({
        isSortByDateActivatedDesc: true,
        isSortByDateActivatedAsc: false,
        isSortByUsernameDesc: false,
        isSortByUsernameAsc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    } else if (isSortByDateActivatedDesc) {
      this.setState({
        isSortByDateActivatedAsc: true,
        isSortByDateActivatedDesc: false,
        isSortByUsernameAsc: false,
        isSortByUsernameDesc: false,
        isSortByDateLastLoginAsc: false,
        isSortByDateLastLoginDesc: false,
      });
    }
  }

  toggleSortByLastLoginDate() {
    let { isSortByDateLastLoginAsc, isSortByDateLastLoginDesc } = this.state;

    if (!(isSortByDateLastLoginAsc || isSortByDateLastLoginDesc)) {
      this.setState({
        isSortByDateLastLoginAsc: true,
        isSortByDateLastLoginDesc: false,
        isSortByDateActivatedAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByUsernameDesc: false,
        isSortByUsernameAsc: false,
      });
    } else if (isSortByDateLastLoginAsc) {
      this.setState({
        isSortByDateLastLoginDesc: true,
        isSortByDateLastLoginAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByDateActivatedAsc: false,
        isSortByUsernameDesc: false,
        isSortByUsernameAsc: false,
      });
    } else if (isSortByDateLastLoginDesc) {
      this.setState({
        isSortByDateLastLoginAsc: true,
        isSortByDateLastLoginDesc: false,
        isSortByDateActivatedAsc: false,
        isSortByDateActivatedDesc: false,
        isSortByUsernameAsc: false,
        isSortByUsernameDesc: false,
      });
    }
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  navigateToUserProfile(username) {
    this.props.history.push({ pathname: "edit-profile/" + username });
  }

  navigateToActivityLog(username, e) {
    this.props.history.push({ pathname: "activity-log/", username: username });
    e.stopPropagation();
  }

  exportTable() {
    let rows = [];
    let tableRows = document.querySelectorAll("table tr");

    for (let i = 0; i < tableRows.length; i++) {
      let row = [];
      let cols = tableRows[i].querySelectorAll("td, th");

      for (let j = 0; j < cols.length - 1; j++) {
        row.push(cols[j].innerText);
      }

      rows.push(row);
    }

    csv.exportFile("User Management", rows);
  }

  render() {
    let {
      lsUser,
      isSortByUsernameAsc,
      isSortByUsernameDesc,
      isSortByDateActivatedAsc,
      isSortByDateActivatedDesc,
      isSortByDateLastLoginAsc,
      isSortByDateLastLoginDesc,
      searchText,
      lsPermission,
    } = this.state;

    const { t } = this.props;

    let lsUserDisplay = lsUser.slice();

    if (isSortByUsernameAsc) {
      lsUserDisplay.sort((a, b) =>
        a.username > b.username ? 1 : b.username > a.username ? -1 : 0
      );
    } else if (isSortByUsernameDesc) {
      lsUserDisplay.sort((a, b) =>
        a.username > b.username ? -1 : b.username > a.username ? 1 : 0
      );
    } else if (isSortByDateActivatedAsc) {
      lsUserDisplay.sort(
        (a, b) =>
          new Date(a.activated_timestamp).getTime() -
          new Date(b.activated_timestamp).getTime()
      );
    } else if (isSortByDateActivatedDesc) {
      lsUserDisplay.sort(
        (a, b) =>
          new Date(b.activated_timestamp).getTime() -
          new Date(a.activated_timestamp).getTime()
      );
    } else if (isSortByDateLastLoginAsc) {
      lsUserDisplay.sort(
        (a, b) =>
          new Date(a.last_login_timestamp).getTime() -
          new Date(b.last_login_timestamp).getTime()
      );
    } else if (isSortByDateLastLoginDesc) {
      lsUserDisplay.sort(
        (a, b) =>
          new Date(b.last_login_timestamp).getTime() -
          new Date(a.last_login_timestamp).getTime()
      );
    }

    if (searchText.length > 0) {
      lsUserDisplay = lsUserDisplay.filter((user, index) => {
        return (
          user.username.includes(searchText) ||
          user.email.includes(searchText) ||
          user.user_type.includes(searchText) ||
          dateFormatter
            .ddmmyyyy(new Date(user.activated_timestamp))
            .includes(searchText) ||
          dateFormatter
            .ddmmyyyy(new Date(user.last_login_timestamp))
            .includes(searchText)
        );
      });
    }

    return (
      <div className="user-management">
        <Row className="heading">
          {t("User Management")}{" "}
          {lsPermission.find((p) => p.label === "Export Information") ? (
            <RiFileExcel2Fill
              className="icon-excel"
              size={25}
              onClick={this.exportTable}
            />
          ) : (
            <></>
          )}
        </Row>
        <Container className="container-table-user-management">
          <Row className="row-search">
            <Form>
              <FormGroup row className="fg-search">
                <Input
                  type="text"
                  name="searchText"
                  id="searchText"
                  value={searchText}
                  onChange={this.handleInputChange}
                />
                <span className="span-search-icon">
                  <IoMdSearch size={25} />
                </span>
              </FormGroup>
            </Form>
          </Row>
          <Table className="table-user-management">
            <thead>
              <tr>
                <th
                  className={
                    isSortByUsernameAsc
                      ? "sort_asc"
                      : isSortByUsernameDesc
                      ? "sort_desc"
                      : "sort"
                  }
                  onClick={this.toggleSortByUsername}
                >
                  {t("Username")}{" "}
                </th>
                <th>{t("Email")}</th>
                <th>{t("User Type")}</th>
                <th
                  className={
                    isSortByDateActivatedAsc
                      ? "sort_asc"
                      : isSortByDateActivatedDesc
                      ? "sort_desc"
                      : "sort"
                  }
                  onClick={this.toggleSortByActivatedDate}
                >
                  {t("Activated Date")}
                </th>
                <th
                  className={
                    isSortByDateLastLoginAsc
                      ? "sort_asc"
                      : isSortByDateLastLoginDesc
                      ? "sort_desc"
                      : "sort"
                  }
                  onClick={this.toggleSortByLastLoginDate}
                >
                  {t("Last Login")}
                </th>
                <th>{t("View Activity Log")}</th>
              </tr>
            </thead>
            <tbody>
              {lsUserDisplay.map((user) => (
                <tr onClick={() => this.navigateToUserProfile(user.username)}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td className={user.is_user_type_approved ? "" : "pending"}>
                    {user.user_type}
                    {user.is_user_type_approved ? "" : ` ${t("Pending")}`}
                  </td>
                  <td>
                    {dateFormatter.ddmmyyyy(new Date(user.activated_timestamp))}
                  </td>
                  <td>
                    {dateFormatter.ddmmyyyy(
                      new Date(user.last_login_timestamp)
                    )}
                  </td>
                  <td
                    className="td-view-activity-log"
                    onClick={this.navigateToActivityLog.bind(
                      this,
                      user.username
                    )}
                  >
                    <FaEye size={25} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default withTranslation()(UserManagement);
