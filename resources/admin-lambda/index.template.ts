export const indexTemplate = `<html>

<head>
  <title>Halloween Event Status</title>
  <style type="text/css">
    html,
    body {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
    }

    .wins {
      width: 100%;
      margin: 16px;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 0.9em;
      font-family: sans-serif;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    }

    .wins thead tr {
      background-color: #009879;
      color: #ffffff;
      text-align: left;
    }

    .wins th,
    .wins td {
      padding: 8px;
    }

    .wins th {
      padding-left: 16px;
    }
  </style>
</head>

<body>
  <h1>Halloween Prize Feed</h1>
  <table border="1" class="wins">
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Winner</th>
        <th>Prize</th>
        <th>DeviantArt Name</th>
      </tr>
    </thead>
    <tbody>
      {{#each wins}}
      <tr>
        <td>{{rowIndex @index}}</td>
        <td>{{time}}</td>
        <td><a href="discord://-/users/{{userId}}">{{userId}}</a></td>
        <td>{{prizeId}}</td>
        <td><a href="https://deviantart.com/{{deviantArtName}}">{{deviantArtName}}</a></td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</body>

</html>`;
