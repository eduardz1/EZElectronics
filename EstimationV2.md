# Project Estimation - FUTURE

Date: 2024-05-03

Version: 2

# Estimation approach

Consider the EZElectronics project in FUTURE version (as proposed by your team in requirements V2), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch (not from V1)

# Estimate by size

We believe in `v2` we'll be able to improve the project without increasing the code base too much, additional time and review processes lead to effective refactoring and smaller average class footprint.

|                                                                                                        |      Estimate      |                                                       Comments                                                        |
| :----------------------------------------------------------------------------------------------------: | :----------------: | :-------------------------------------------------------------------------------------------------------------------: |
|                            NC = Estimated number of classes to be developed                            |         7          | In addition to the four classes of `v1`, we will need to add classes for the Wishlist, the Payment Service and Review |
|                              A = Estimated average size per class, in LOC                              |        500         |                                                                                                                       |
|                           S = Estimated size of project, in LOC (= NC \* A)                            |        3500        |                                                                                                                       |
|          E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)          |        350         |                                                                                                                       |
|                  C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                   |       €10500       |                                                                                                                       |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week) | 2.2 calendar weeks |                                                                                                                       |

# Estimate by product decomposition

| Component Name       | Estimated effort (person hours) |                                                 comments                                                 |
| :------------------- | :-----------------------------: | :------------------------------------------------------------------------------------------------------: |
| Requirement Document |               130               |   Estimated based on our additional work on the requirements, given also the preliminary work for `v1`   |
| GUI Prototype        |               30                |              GUI for `v2` is much improved and the work on it needs to increase accordingly              |
| Design Document      |                5                |                                                                                                          |
| Code                 |               250               | We estimate that the additional work we described will increase the project size by approximately $50\%$ |
| Unit tests           |               50                |                                                                                                          |
| API tests            |               50                |                                                                                                          |
| Management Documents |               20                |                                                                                                          |

We estimate in total $\displaystyle\frac{\sum E_i}{N * H * W} \approx 3.3$ calendar weeks to complete the project, where $E_i$ is the estimated effort for each component, $N$ is the number of people working on the project, $H$ is the number of working hours per day, and $W$ is the number of working days per week.

## Estimate by activity decomposition

All of our activities are based on the `IEEE 12207` standard.

Compared to `v1`, we have added some activities that we consider necessary to expand the product how we envisioned.

| Activity name                                      | Estimated effort (person hours) |                                                                                                                                        Comments                                                                                                                                        |
| :------------------------------------------------- | :-----------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| a) **Stakeholder Requirements Definition Process** |               12                |                                                                                           Define the stakeholder classes that have legitimate interest in the system through its life cycle                                                                                            |
| b) **Software Implementation Processes**           |            $\sum b$             |                                                                                                                             Implement the software system                                                                                                                              |
| b.1) Software Requirements Analysis Process        |               100               |                                                                                                      Analyze the requirements of the system and define the software requirements                                                                                                       |
| b.2) Software Architectural Design Process         |               40                |                                                                                                            Define the software architecture (for examples Database system)                                                                                                             |
| b.3) Software Detailed Design Process              |               30                |                                                                                                     Includes both the graphical design of the user interface and the domain model                                                                                                      |
| b.4) Software Construction Process                 |               350               |                                                                                    Produce software that properly reflects the software design, this activity includes unit and integration testing                                                                                    |
| c) **Software Support Processes**                  |            $\sum c$             |                                                                                                                               Assist the other processes                                                                                                                               |
| c.1) Software Documentation Management Process     |               40                |                                                                                                                 Develop and maintain the documentation of the software                                                                                                                 |
| c.2) Software Quality Assurance Process            |               20                |                                                                                                           Provide assurance that the product works in a satisfactory manner                                                                                                            |
| c.3) Software Review Process                       |                6                |                                                                                                                    Review the software from a technical perspective                                                                                                                    |
| d) **Acquisition Process**                         |            $\sum d$             |                 To scale our product into `V2` we need to establish stronger bonds with _Payment Service_ providers, advertise our proposal to established _Managers_ to avoid starting with no user base. Furthermore, we need to get in talk with local authorities.                 |
| d.1) Acquisition Preparation                       |               16                |                                                                             An analysis needs to be done to understand the various options for integration with payment services and their respective fees                                                                             |
| d.2) Acquisition Advertisement                     |                8                |                                                                                                     We need to communicate our idea with established managers to get them on board                                                                                                     |
| d.3) Contract Agreement                            |               10                |                                                                                     This includes the time to negotiate with the payment service providers and managers but also local authorities                                                                                     |
| e) **Supply Process**                              |            $\sum e$             | After an initial investment and a user base is established, we expect _Managers_ to contact us, therefore, we need to transition into a product supply approach, where we impose fees on each product listing. Our goal now should be to gather more strictly to the _Managers_' needs |
| e.1) Supply Tendering                              |               12                |                                                                                                       We need to review the Manager' needs and start to gather feedback for a V3                                                                                                       |
| f) **Software Validation Process**                 |               40                |                                                                                                                   Validate that the requirements have been fulfilled                                                                                                                   |
| g) **Human Resource Management Process**           |               30                |                                                                                      Manage the team and distribute the work in a way that utilizes best each team member's skills and abilities                                                                                       |

With a total estimated effort of $\sum{\sum_{i=a}^g i} = 724$ person hours, we can calculate that it will take $\approx 4.5$ calendar weeks to complete the project, given a team of 4 people working 8 hours a day, 5 days a week.

### Gantt Chart

Hatched areas represent calendar time.

![Gantt Chart](figures/v2/gantt-chart.drawio.svg)

# Summary

|      Estimate by       | Estimated effort (person hours) | Estimated duration (person calendar weeks) |                                                     Comments                                                     |
| :--------------------: | :-----------------------------: | :----------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
|          Size          |               350               |                    8.8                     |                             This estimation is derived only from the envisioned code                             |
| Product decomposition  |               535               |                    13.4                    | This estimation takes into account more variables than the size estimation, leading to a more accurate estimate. |
| Activity decomposition |               724               |                    18.1                    |                This estimation is the most accurate, as it considers all aspects of the project.                 |
