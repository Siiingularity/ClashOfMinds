Clash of Minds – Singularity Requirements


1) User Registration (POST): Allows a new user to create an account in the system using a username and password.

2) User Login (POST): Authenticates the user using their username and password and allows access to the system.

3) User Logout (POST): Ends the active session and logs the user out of the system.

4) Create Game Session (POST): Enables the user to create a new game session by specifying the game name and number of players.

5) Team Setup (POST): Allows setting team names before the game starts.

6) Power-Up Selection (POST): Allows each team to select two power-ups (block, double, steal) before the game begins.

7) Category Listing (GET): Retrieves the list of all available question categories in the system.

8) Category Selection (POST): Allows the user to select 6 categories for the game.

9) Display Game Board (GET): Generates and displays the game board based on the selected categories.

10) Display Question (GET): Shows the corresponding question on the screen based on the selected category and point value.

11) Start Timer (POST): Starts a 60-second countdown when a question is opened.

12) Show Answer (GET): Displays the correct answer either when time runs out or upon user request.

13) Update Score (PUT): Updates the team’s score based on whether the question was answered correctly or incorrectly.

14) Use Power-Up (PUT): Updates the game state when a team uses one of its selected power-ups.

15) Disable Question (PUT): Marks a question as inactive after it has been answered to prevent it from being selected again.

16) Switch Turn (PUT): Changes the active team after each question.

17) End Game (POST): Ends the game when all questions are answered or upon user request.

18) Display Results (GET): Shows the final scores of the teams and displays the winning team.
