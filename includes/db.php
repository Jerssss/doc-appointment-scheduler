<?php
require 'vendor/autoload.php'; // MongoDB PHP library

// Connect to MongoDB server
$client = new MongoDB\Client("mongodb://localhost:27017/");

// Select your database
$db = $client->softeng;

// Select your users collection
$users = $db->users;
?>
