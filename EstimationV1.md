# Project Estimation - CURRENT
Date:

Version:


# Estimation approach
Consider the EZElectronics  project in CURRENT version (as given by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch
# Estimate by size
### 
|                                                                                                         | Estimate |                                                                                                             comments                                                                                                             |
| ------------------------------------------------------------------------------------------------------- | -------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| NC =  Estimated number of classes to be developed                                                       | 4        |                                                                               we have 4 classes : Authentication,User ,Product and Cart Managment                                                                                |
| A = Estimated average size per class, in LOC                                                            | 600LOC   | We estimate the Authentication component will require about 300 lines of code (LOC), while Cart Management will need significantly more. Given the complexities involved, 600 LOC is a suitable average estimate for each class. |
| S = Estimated size of project, in LOC (= NC * A)                                                        | 2400LOC  |                                                                         The size of project is number of classes times Estimated average size per class.                                                                         |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 60ph     |                        The total estimated LOC for the project is 2400. Dividing this by 10 LOC per person-hour and further by 4 team members results in a total estimated labor time of 60 person-hours.                        |
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 1800€    |                                                     The cost per person-hour is €30. When multiplied by the estimated 60 person-hours, the personnel cost amounts to €1,800.                                                     |
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 8.5pw    |                                 We utilize the activity decomposition methodology, which accounts for 345 person-hours, resulting in an estimated duration of approximately 8.5 calendar weeks.                                  |

# Estimate by product decomposition
### 
| component name | Estimated effort (person hours) | comments |
| -------------- | ------------------------------- | :-------: |
|requirement document    | 12 | |
| GUI prototype | 12 |  | 
|design document |15|   |
|code |160|We allocated 240 hours for implementation and testing, with approximately 60% of this time dedicated to  just coding.    | 
| unit tests |40 | 20% of 240 hours for unit testing  |
| api tests |40 |  20% of 240 hours for unit testing |
| management documents  |10| |


# Estimate by activity decomposition
### 
| Activity name              | Estimated effort (person hours) |
| -------------------------- | ------------------------------- |
| **Requirements Gathering** | 20                              |
| **System Analysis**        | 15                              |
| **Design**                 | 25                              |
| **Development (Coding)**   | 160                             |
| **Testing**                | 80                              |
| **Quality Assurance**      | 15                              |
| **Documentation**          | 30                              |
###
Insert here Gantt chart with above activities

# Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort (person hours) | Estimated duration (person weeks) | comments |
| ---------------------------------- | ------------------------------- | --------------------------------- | :-----------:|
| estimate by size                   | 240                             | 6                                 | This estimation is derived from the combined estimated time for coding and testing. |
| estimate by product decomposition  | 289                             | 7                                 | This estimation is derived from the combined product decomposition. |
| estimate by activity decomposition | 345                             | 8.5                               | This estimation is derived from the combined activity decomposition. | 




