import { Col, Row, Switch } from "antd";
import React, { useState } from "react";
import { Button } from "../../../../components/buttons/buttons";
import { Cards } from "../../../../components/cards/frame/cards-frame";
import Heading from "../../../../components/heading/heading";
import { NotificationWrapper } from "./style";

const listStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: 0,
  padding: 0,
};

function Notification() {
  // State for Notifications section
  const [notificationsState, setNotificationsState] = useState({
    companyNews: false,
    meetups: true,
    opportunities: false,
    weeklyNews: true,
    toggleAllText: "Toggle all",
  });

  // State for Account Activity section
  const [accountActivityState, setAccountActivityState] = useState({
    companyNews: false,
    meetups: true,
    opportunities: false,
    weeklyNews: true,
    toggleAllText: "Toggle all",
  });

  // Handle toggle all for Notifications section
  const handleNotificationsToggleAll = (e) => {
    e.preventDefault();
    const allEnabled =
      notificationsState.companyNews &&
      notificationsState.meetups &&
      notificationsState.opportunities &&
      notificationsState.weeklyNews;

    if (allEnabled) {
      // Disable all
      setNotificationsState({
        companyNews: false,
        meetups: false,
        opportunities: false,
        weeklyNews: false,
        toggleAllText: "Toggle all",
      });
    } else {
      // Enable all
      setNotificationsState({
        companyNews: true,
        meetups: true,
        opportunities: true,
        weeklyNews: true,
        toggleAllText: "Disable all",
      });
    }
  };

  // Handle individual switch change for Notifications section
  const handleNotificationsSwitchChange = (key, checked) => {
    const newState = { ...notificationsState, [key]: checked };
    const allEnabled =
      newState.companyNews &&
      newState.meetups &&
      newState.opportunities &&
      newState.weeklyNews;
    newState.toggleAllText = allEnabled ? "Disable all" : "Toggle all";
    setNotificationsState(newState);
  };

  // Handle toggle all for Account Activity section
  const handleAccountActivityToggleAll = (e) => {
    e.preventDefault();
    const allEnabled =
      accountActivityState.companyNews &&
      accountActivityState.meetups &&
      accountActivityState.opportunities &&
      accountActivityState.weeklyNews;

    if (allEnabled) {
      // Disable all
      setAccountActivityState({
        companyNews: false,
        meetups: false,
        opportunities: false,
        weeklyNews: false,
        toggleAllText: "Toggle all",
      });
    } else {
      // Enable all
      setAccountActivityState({
        companyNews: true,
        meetups: true,
        opportunities: true,
        weeklyNews: true,
        toggleAllText: "Disable all",
      });
    }
  };

  // Handle individual switch change for Account Activity section
  const handleAccountActivitySwitchChange = (key, checked) => {
    const newState = { ...accountActivityState, [key]: checked };
    const allEnabled =
      newState.companyNews &&
      newState.meetups &&
      newState.opportunities &&
      newState.weeklyNews;
    newState.toggleAllText = allEnabled ? "Disable all" : "Toggle all";
    setAccountActivityState(newState);
  };

  return (
    <NotificationWrapper>
      <Cards
        title={
          <div className="setting-card-title">
            <Heading as="h4">Notifications</Heading>
            <span>Choose What Notification you will Receive</span>
          </div>
        }
      >
        <Row gutter={15}>
          <Col xs={24}>
            <div className="notification-box-single">
              <Cards
                headless
                bodyStyle={{ backgroundColor: "#F7F8FA", borderRadius: 10 }}
              >
                <div
                  style={{
                    height: "50px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  className="notification-header"
                >
                  <Heading className="notification-header__text" as="h4">
                    Notifications
                  </Heading>
                  <a
                    href="#"
                    className="btn-toggle cursor-pointer"
                    onClick={handleNotificationsToggleAll}
                  >
                    {notificationsState.toggleAllText}
                  </a>
                </div>
                <div className="notification-body">
                  <Cards headless>
                    <nav>
                      <ul>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Company News
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={notificationsState.companyNews}
                            onChange={(checked) =>
                              handleNotificationsSwitchChange(
                                "companyNews",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Meetups Near you
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={notificationsState.meetups}
                            onChange={(checked) =>
                              handleNotificationsSwitchChange(
                                "meetups",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Opportunities
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={notificationsState.opportunities}
                            onChange={(checked) =>
                              handleNotificationsSwitchChange(
                                "opportunities",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Weekly News Letters
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={notificationsState.weeklyNews}
                            onChange={(checked) =>
                              handleNotificationsSwitchChange(
                                "weeklyNews",
                                checked
                              )
                            }
                          />
                        </li>
                      </ul>
                    </nav>
                  </Cards>
                </div>
              </Cards>
            </div>
          </Col>

          <Col xs={24}>
            <div className="notification-box-single">
              <Cards
                headless
                bodyStyle={{ backgroundColor: "#F7F8FA", borderRadius: 10 }}
              >
                <div
                  style={{
                    height: "50px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  className="notification-header"
                >
                  <Heading className="notification-header__text" as="h4">
                    Account Activity
                  </Heading>
                  <a
                    href="#"
                    className="btn-toggle cursor-pointer"
                    onClick={handleAccountActivityToggleAll}
                  >
                    {accountActivityState.toggleAllText}
                  </a>
                </div>
                <div className="notification-body">
                  <Cards headless>
                    <nav>
                      <ul>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Company News
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={accountActivityState.companyNews}
                            onChange={(checked) =>
                              handleAccountActivitySwitchChange(
                                "companyNews",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Meetups Near you
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={accountActivityState.meetups}
                            onChange={(checked) =>
                              handleAccountActivitySwitchChange(
                                "meetups",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Opportunities
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={accountActivityState.opportunities}
                            onChange={(checked) =>
                              handleAccountActivitySwitchChange(
                                "opportunities",
                                checked
                              )
                            }
                          />
                        </li>
                        <li style={listStyle}>
                          <div className="notification-list-single">
                            <Heading
                              className="notification-list-single__title"
                              as="h4"
                            >
                              Weekly News Letters
                            </Heading>
                            <p>
                              Get Company News, announcements, and product
                              updates
                            </p>
                          </div>
                          <Switch
                            checked={accountActivityState.weeklyNews}
                            onChange={(checked) =>
                              handleAccountActivitySwitchChange(
                                "weeklyNews",
                                checked
                              )
                            }
                          />
                        </li>
                      </ul>
                    </nav>
                  </Cards>
                </div>
              </Cards>
            </div>
          </Col>
        </Row>
        <div className="notification-actions">
          <Button size="default" type="primary">
            Update Email Notifications
          </Button>
          &nbsp; &nbsp;
          <Button size="default" type="light">
            Cancel
          </Button>
        </div>
      </Cards>
    </NotificationWrapper>
  );
}

export default Notification;
