# Project Estimation - CURRENT

Date: 2024-05-01

Version: 1

## Estimation approach

Consider the EZElectronics project in CURRENT version (as given by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch

## Estimate by size

## FIXME: number of classes??

|                                                                                                         | Estimate |                                                                                                             comments                                                                                                             |
| ------------------------------------------------------------------------------------------------------- | -------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| NC = Estimated number of classes to be developed                                                        | 6        |                                                                               we have 4 classes : Authentication,User ,Product and Cart Managment                                                                                |
| A = Estimated average size per class, in LOC                                                            | 600LOC   | We estimate the Authentication component will require about 300 lines of code (LOC), while Cart Management will need significantly more. Given the complexities involved, 600 LOC is a suitable average estimate for each class. |
| S = Estimated size of project, in LOC (= NC \* A)                                                       | 2400LOC  |                                                                         The size of project is number of classes times Estimated average size per class.                                                                         |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 60ph     |                        The total estimated LOC for the project is 2400. Dividing this by 10 LOC per person-hour and further by 4 team members results in a total estimated labor time of 60 person-hours.                        |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 1800€    |                                                     The cost per person-hour is €30. When multiplied by the estimated 60 person-hours, the personnel cost amounts to €1,800.                                                     |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 1.5pw    |                                 We utilize the activity decomposition methodology, which accounts for 345 person-hours, resulting in an estimated duration of approximately 8.5 calendar weeks.                                  |

## Estimate by product decomposition

| Component Name       | Estimated effort (person hours) |                                                       comments                                                       |
| -------------------- | ------------------------------- | :------------------------------------------------------------------------------------------------------------------: |
| Requirement Document | 25                              |                                                                                                                      |
| GUI Prototype        | 7                               |                                                                                                                      |
| Design Document      | 3                               |                                                                                                                      |
| Code                 | 160                             | We allocated 240 hours for implementation and testing, with approximately 60% of this time dedicated to just coding. |
| Unit tests           | 40                              |                                          20% of 240 hours for unit testing                                           |
| API tests            | 40                              |                                          20% of 240 hours for unit testing                                           |
| Management Documents | 10                              |                                                                                                                      |

## Estimate by activity decomposition

| Activity name              | Estimated effort (person hours) |
| -------------------------- | ------------------------------- |
| **Requirements Gathering** | 30                              |
| **System Analysis**        | 15                              |
| **Design**                 | 15                              |
| **Development (Coding)**   | 160                             |
| **Testing**                | 80                              |
| **Quality Assurance**      | 15                              |
| **Documentation**          | 30                              |

###

## TODO! GANTT CHART

Insert here Gantt chart with above activities

## Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

| Estimate by            | Estimated effort (person hours) | Estimated duration (person weeks) |                                                     comments                                                     |
| ---------------------- | ------------------------------- | --------------------------------- | :--------------------------------------------------------------------------------------------------------------: |
| Size                   | 60                              | 1.5                               |                              This estimation is derived only from the provided code                              |
| Product decomposition  | 285                             | 7.1                               | This estimation takes into account more variables than the size estimation, leading to a more accurate estimate. |
| Activity decomposition | 345                             | 8.4                               |                This estimation is the most accurate, as it considers all aspects of the project.                 |
