<?php

// print_r($_POST); exit;

// if(isset($_POST["cropped"])) {
//     readfile($_FILES["cropped"]["tmp_name"]);
// }

  $encodedData = str_replace('data:image/png;base64,','', @$_POST['cropped']);
  $decodedData = base64_decode($encodedData);

  header('Content-type: image/png');
  echo $decodedData;
?>