### 搭建python selenium测试

#### 1. 将chromediver.ext 拷贝到电脑目录  *例如C:\selenium*

#### 2. 将*C:\selenium*  添加到环境变量中

#### 3. 安装selenium   
> pip install selenium

*示例 Demo*

***

``` py
    import unittest

    import time
    from selenium import webdriver
    from selenium.webdriver.common.keys import Keys

    class PythonOrgSearch(unittest.TestCase):

        def setUp(self):
            self.driver = webdriver.Chrome(r"chromedriver.exe")

        def test_search_in_python_org(self):
            driver = self.driver
            driver.get("http://192.168.1.68")
            self.assertIn("C-CLOUD", driver.title)
            elem = driver.find_element_by_id("user_login")
            elem.send_keys("userName")

            time.sleep(2)
            #
            elem = driver.find_element_by_id("user_pass")
            elem.send_keys("passWord")
            #

            time.sleep(2)


            driver.find_element_by_name("wp-submit").click()

            # assert "No results found." not in driver.page_source
            time.sleep(2)

        def tearDown(self):
            self.driver.close()

    if __name__ == "__main__":
        unittest.main()
 

```
