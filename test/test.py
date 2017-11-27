#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
import os
import HTMLTestRunner
from random import choice, randint
from time import sleep
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

def getByXpath(driver, path):
    # return driver.find_element_by_xpath(path)
    return WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, path)))

class PlayGame(unittest.TestCase):
    name = ''
    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.implicitly_wait(1)
        self.driver.set_window_position(0, 0)
        self.driver.get("http://localhost:8080")
        self.nb_direction2test = 5;

    def play(self):
        body = getByXpath(self.driver, "/html/body")
        keys = [Keys.LEFT, Keys.RIGHT, Keys.UP, Keys.DOWN]
        for _ in range(self.nb_direction2test):
            key = choice(keys)
            try: body.send_keys(key)
            except: break # a été mangé !
            sec = randint(0, 4)
            sleep(sec)

    def test_0_start(self):
        sleep(1)
        error = self.driver.get_log("browser")
        self.assertIsNotNone(error)

    def test_1_playAsGuess(self):
        getByXpath(self.driver, "//*[@id='not-log']/form/button").click()
        self.play()
        error = self.driver.get_log("browser")
        self.assertIsNotNone(error)

    def test_2_createAccount(self):
        pseudo = getByXpath(self.driver, "//*[@id='not-log']/div/form[1]/input[1]")
        pwd    = getByXpath(self.driver, "//*[@id='not-log']/div/form[1]/input[2]")
        email  = getByXpath(self.driver, "//*[@id='not-log']/div/form[1]/input[3]")
        create = getByXpath(self.driver, "//*[@id='not-log']/div/form[1]/button")
        errorL = getByXpath(self.driver, "//*[@id='not-log']/div/div")
        pwd.send_keys('12345678')
        while True:
            PlayGame.name = 'testUser' + str(randint(100,999))
            pseudo.send_keys(self.name)
            email.send_keys(self.name + '@test.com')
            create.click()
            if errorL.text != '* Pseudo already used': break
        alert = self.driver.switch_to.alert
        sleep(1)
        alert.accept()
        error = self.driver.get_log("browser")
        self.assertIsNotNone(error)

    def test_3_connection(self):
        getByXpath(self.driver, "//*[@id='not-log']/div/form[1]/p/a").click()
        pseudo = getByXpath(self.driver, "//*[@id ='not-log']/div/form[2]/input[1]")
        pwd    = getByXpath(self.driver, "//*[@id ='not-log']/div/form[2]/input[2]")
        login  = getByXpath(self.driver, "//*[@id ='not-log']/div/form[2]/button")
        errorL = getByXpath(self.driver, "//*[@id='not-log']/div/div")
        pseudo.send_keys(self.name)
        pwd.send_keys('12345678')
        login.click()
        sleep(0.5)
        if errorL.text: print errorL.text
        self.play()
        error = self.driver.get_log("browser")
        self.assertIsNotNone(error)

    def tearDown(self):
        self.driver.quit() # close the browser window

# create a test
game_test = unittest.TestLoader().loadTestsFromTestCase(PlayGame)

# open the report file
outfile = open("src/test.html", "w")

# configure HTMLTestRunner options
runner = HTMLTestRunner.HTMLTestRunner(stream=outfile,title='Test Report')

# run the test using HTMLTestRunner
runner.run(game_test)
