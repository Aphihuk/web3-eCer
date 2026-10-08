<?php
setcookie("authToken", "", time() - 3600, "/");
?>
<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>
<script>
  localStorage.removeItem("authToken");
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  window.location.replace("../../learnnbadge-ui.php");
</script>

</body>
</html>