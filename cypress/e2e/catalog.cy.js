describe("WebbyLab - Product Catalog", () => {
  // Check that the product catalog opens and displays products
  it("should open the product catalog", () => {
    cy.visit("http://localhost:3000");

    cy.contains("Базова футболка").should("be.visible");
  });

  // BUG-01------------------------------------------------------------------------------------------------------
  // Verify product filtering in all categories
  const categoryProducts = {
    Одяг: ["Базова футболка", "Сині джинси", "Демісезонна куртка"],
    Взуття: ["Кросівки бігові", "Шкіряні черевики", "Літні сандалі"],
    Аксесуари: ["Наручний годинник", "Шкіряний ремінь", "Сонцезахисні окуляри"],
    Електроніка: [
      "Бездротові навушники",
      "Механічна клавіатура",
      "Комп'ютерна миша",
    ],
  };

  Object.entries(categoryProducts).forEach(([category, expectedProducts]) => {
    it(`should display the correct products in ${category}`, () => {
      cy.visit("http://localhost:3000");

      // Select the category
      cy.contains("button", category).click();

      // Check that exactly 3 products are displayed
      cy.get("button")
        .filter((index, button) => button.innerText.trim() === "Додати в кошик")
        .should("have.length", 3);

      // Verify that all expected products are displayed
      expectedProducts.forEach((product) => {
        cy.contains(product).should("be.visible");
      });

      // Verify that products from other categories are not displayed
      const otherProducts = Object.entries(categoryProducts)
        .filter(([otherCategory]) => otherCategory !== category)
        .flatMap(([, products]) => products);

      otherProducts.forEach((product) => {
        cy.contains(product).should("not.exist");
      });
    });
  });

  // BUG-02------------------------------------------------------------------------------------------------------
  // Price sorting
  const categories = ["Одяг", "Взуття", "Аксесуари", "Електроніка"];

  categories.forEach((category) => {
    // BUG-02 — Verify descending price sorting in each category
    it(`should sort products by price from highest to lowest in ${category}`, () => {
      cy.visit("http://localhost:3000");

      // Select a product category
      cy.contains("button", category).click();

      // Select descending price sorting
      cy.get("select").select("desc");

      // Get product prices
      cy.get('[class*="_price_"]').then(($prices) => {
        const prices = [...$prices].map((element) =>
          Number(element.innerText.replace(/[^\d]/g, ""))
        );

        // Verify that the category contains products
        expect(prices.length).to.be.greaterThan(0);

        // Create a sorted copy of prices
        const sortedPrices = [...prices].sort((a, b) => b - a);

        // Compare actual and expected price order
        expect(prices).to.deep.equal(sortedPrices);
      });
    });
  });

  // BUG-03------------------------------------------------------------------------------------------------------
  // Cart counter is not updated
  it("should update the cart counter after adding a product", () => {
    cy.visit("http://localhost:3000");

    // Check that the cart is empty
    cy.contains("Кошик: 0").should("be.visible");

    // Add the first product to the cart
    cy.contains("button", "Додати в кошик").first().click();

    // Check that the cart counter is updated
    cy.contains("Кошик: 1").should("be.visible");
  });

  // BUG-04------------------------------------------------------------------------------------------------------
  // Product Details button does not work
  it("should open the product details page", () => {
    // Open the product catalog
    cy.visit("http://localhost:3000");

    // Find the product and click its Details button
    cy.contains("Базова футболка")
      .closest('[class*="_card_"]')
      .contains("Детальніше")
      .click();

    // Check that the product details page is opened
    cy.url().should("include", "/product/1");
  });

  // Verify navigation to product details by clicking the product name
  it("should open the product details page by clicking the product name", () => {
    cy.visit("http://localhost:3000");

    // Click the product name
    cy.contains("Базова футболка").click();

    // Verify that the product details page is opened
    cy.url().should("include", "/product/");

    // Verify that the selected product is displayed
    cy.contains("Базова футболка").should("be.visible");
  });

  // BUG-05------------------------------------------------------------------------------------------------------
  // Wrong Error Message Is Shown Under the Email Field
  it("should show the correct validation message under the Email field", () => {
    // Open the product catalog
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Базова футболка")
      .closest('[class*="_card_"]')
      .contains("Додати в кошик")
      .click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Fill in the checkout form with invalid data
    cy.get("input").eq(0).type("1111");
    cy.get("input").eq(1).type("12131");
    cy.get("input").eq(2).type("1314455");
    cy.get("input").eq(3).type("у213ву23");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the Email field displays the correct validation message
    cy.get('input[name="email"]')
      .parent("label")
      .find('span[class*="_error_"]')
      .should("be.visible")
      .and("contain.text", "Введіть коректну електронну адресу");
  });

  // Negative test — Validate Email without a top-level domain
  it("should reject an Email without a top-level domain", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Enter valid data except for the Email
    cy.get("input").eq(0).type("Anna Ivanenko");
    cy.get("input").eq(1).type("test@gmail");
    cy.get("input").eq(2).type("0991234567");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that an Email validation error is displayed
    cy.contains("Введіть коректну електронну адресу").should("be.visible");
  });

  // BUG-06------------------------------------------------------------------------------------------------------
  // Validate Full Name field with special characters
  it("should reject special characters in the Full Name field", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Enter invalid name and valid data in other fields
    cy.get("input").eq(0).type("!@#$%^&*");
    cy.get("input").eq(1).type("test@example.com");
    cy.get("input").eq(2).type("0991234567");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Intercept the order creation request before submitting
    cy.intercept("POST", "**/api/order").as("createOrder");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the order is rejected for an invalid name
    cy.wait("@createOrder").then((interception) => {
      expect(interception.response.statusCode).not.to.eq(200);
    });
  });

  // Validate numeric-only Full Name
  it("should reject a Full Name containing only numbers", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Enter a numeric-only name and valid data in other fields
    cy.get("input").eq(0).type("232323");
    cy.get("input").eq(1).type("test@example.com");
    cy.get("input").eq(2).type("0991234567");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Intercept the order creation request
    cy.intercept("POST", "**/api/order").as("createOrder");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the order is rejected for an invalid name
    cy.wait("@createOrder").then((interception) => {
      expect(interception.response.statusCode).not.to.eq(200);
    });
  });

  // Negative test — Validate letters in the Phone field
  it("should reject letters in the Phone field", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Enter valid data except for the phone number
    cy.get("input").eq(0).type("Anna Ivanenko");
    cy.get("input").eq(1).type("test@example.com");
    cy.get("input").eq(2).type("abcdefghij");
    cy.get('input[name="phone"]').should("have.value", "abcdefghij");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Intercept the order creation request
    cy.intercept("POST", "**/api/order").as("createOrder");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the order is rejected for an invalid phone number
    cy.wait("@createOrder").then((interception) => {
      expect(interception.response.statusCode).not.to.eq(200);
    });

    // Check that the checkout page remains open
    cy.url().should("include", "/checkout");

    // Verify that the Phone field displays the correct validation message
    cy.get('input[name="phone"]').should(
      "contain.text",
      "Введіть коректний номер телефону"
    );
  });

  // Cart Functionality — Positive Tests-------------------------------------------------------------------------
  // Verify that the product quantity increases when clicking the plus button
  it("should increase the product quantity from 1 to 2", () => {
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Додати в кошик").first().click();

    // Find the quantity controls for the first product
    cy.contains("Детальніше")
      .first()
      .parent()
      .within(() => {
        // Verify the initial quantity
        cy.contains("1").should("be.visible");

        // Increase the quantity
        cy.contains("button", "+").click();

        // Verify the updated quantity
        cy.contains("2").should("be.visible");
      });
  });

  // Verify that the product quantity decreases when clicking the minus button
  it("should decrease the product quantity from 2 to 1", () => {
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Додати в кошик").first().click();

    // Find the quantity controls for the first product
    cy.contains("Детальніше")
      .first()
      .parent()
      .within(() => {
        // Increase the quantity to 2
        cy.contains("button", "+").click();
        cy.contains("2").should("be.visible");

        // Decrease the quantity to 1
        cy.contains("button", "−").click();

        // Verify the updated quantity
        cy.contains("1").should("be.visible");
      });
  });

  // Verify that decreasing the quantity from 1 removes the product
  it("should remove the product when decreasing quantity from 1", () => {
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Додати в кошик").first().click();

    // Find the first product controls
    cy.contains("Детальніше")
      .first()
      .parent()
      .within(() => {
        // Verify the initial quantity
        cy.contains("1").should("be.visible");

        // Decrease the quantity
        cy.contains("button", "−").click();

        // Verify that the Add to Cart button is displayed again
        cy.contains("Додати в кошик").should("be.visible");
      });
  });

  // BUG-07------------------------------------------------------------------------------------------------------
  // Prevent order submission with negative product quantity
  it("should reject an order with negative product quantity", () => {
    // Open the product catalog
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();
    cy.url().should("include", "/checkout");

    // Decrease the product quantity twice
    cy.get('button[class*="qtyBtn"]').first().click();
    cy.get('button[class*="qtyBtn"]').first().click();

    // Check whether the application allows a negative quantity
    cy.get('span[class*="qtyValue"]').then(($quantity) => {
      const quantity = Number($quantity.text().trim());

      if (quantity < 0) {
        // Fill in the checkout form with valid customer data
        cy.get('input[name="name"]').type("Anna Ivanenko");
        cy.get('input[name="email"]').type("anna.ivanenko@example.com");
        cy.get('input[name="phone"]').type("0991234567");
        cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

        // Intercept the order creation request
        cy.intercept("POST", "**/api/order").as("createOrder");

        // Submit the order
        cy.contains("Підтвердити замовлення").click();

        // Verify that the server rejects an invalid order
        cy.wait("@createOrder").then((interception) => {
          expect(interception.response.statusCode).to.not.eq(200);
        });
      } else {
        // Verify that the quantity cannot be negative
        expect(quantity).to.be.at.least(0);
      }
    });
  });

  // Prevent negative product quantity on checkout
  it("should prevent negative product quantity on checkout", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();
    cy.url().should("include", "/checkout");

    // Verify the initial quantity
    cy.get('span[class*="qtyValue"]').should("have.text", "1");

    // Click the minus button twice
    cy.get('button[class*="qtyBtn"]').first().click();
    cy.get('button[class*="qtyBtn"]').first().click();

    // Verify that the quantity cannot become negative
    cy.get('span[class*="qtyValue"]').should("not.have.text", "-1");
  });

  // Checkout — Positive Tests
  // Verify total price calculation
  it("should update the total price when product quantity increases", () => {
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Verify that the checkout page is opened
    cy.url().should("include", "/checkout");

    // Verify the initial product quantity
    cy.get('span[class*="qtyValue"]').should("have.text", "1");

    // Verify the initial total price
    cy.contains("Разом:").parent().should("contain.text", "499 грн");

    // Increase the product quantity
    cy.contains("button", "+").first().click();

    // Verify that the quantity increases to 2
    cy.get('span[class*="qtyValue"]').should("have.text", "2");

    // Verify that the total price is updated correctly
    cy.contains("Разом:").parent().should("contain.text", "998 грн");
  });

  // Complete checkout with valid customer data
  it("should successfully place an order with valid customer data", () => {
    cy.visit("http://localhost:3000");

    // Add the first product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();

    // Verify that the checkout page is opened
    cy.url().should("include", "/checkout");

    // Fill in the checkout form with valid customer data
    cy.get("input").eq(0).type("Anna Ivanenko");
    cy.get("input").eq(1).type("anna.ivanenko@example.com");
    cy.get("input").eq(2).type("0991234567");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify the success message
    cy.contains("Дякуємо за замовлення!").should("be.visible");

    // Verify that the customer name is displayed
    cy.contains("Anna Ivanenko").should("be.visible");
  });

  // BUG-08 — Prevent order submission with an empty cart--------------------------------------------------------
  it("should prevent order submission with an empty cart", () => {
    // Open the catalog with an empty cart
    cy.visit("http://localhost:3000", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });

    // Verify that the cart is empty
    cy.contains("Кошик: 0").should("be.visible");

    // Open the checkout page
    cy.contains("Замовити").click();

    // Verify that the checkout page is opened
    cy.url().should("include", "/checkout");

    // Verify that the empty cart message is displayed
    cy.contains("Кошик порожній").should("be.visible");

    // Fill in the checkout form with valid customer data
    cy.get("input").eq(0).type("Anna Ivanenko");
    cy.get("input").eq(1).type("anna.ivanenko@example.com");
    cy.get("input").eq(2).type("0991234567");
    cy.get("input").eq(3).type("Kyiv, Khreshchatyk 10");

    // Intercept the order creation request
    cy.intercept("POST", "**/api/order").as("createOrder");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the server rejects an empty order
    cy.wait("@createOrder").then((interception) => {
      const statusCode = interception.response.statusCode;

      // Check whether the success message is displayed
      cy.contains("Дякуємо за замовлення!").then(($message) => {
        const successMessageVisible = $message.is(":visible");

        expect(
          statusCode !== 200 && !successMessageVisible,
          "Empty cart order must be rejected without success confirmation"
        ).to.be.true;
      });
    });
  });

  // BUG-09 — Handle server error when address contains only spaces----------------------------------------------
  it("should recover from a server error when address contains only spaces", () => {
    cy.visit("http://localhost:3000");

    // Add a product to the cart
    cy.contains("Додати в кошик").first().click();

    // Open the checkout page
    cy.contains("Замовити").click();
    cy.url().should("include", "/checkout");

    // Fill in the checkout form with valid customer data
    cy.get("input").eq(0).type("Anna Ivanenko");
    cy.get("input").eq(1).type("anna.ivanenko@example.com");
    cy.get("input").eq(2).type("0991234567");

    // Enter only spaces in the Address field
    cy.get("input").eq(3).type("     ");

    // Intercept the order request
    cy.intercept("POST", "**/api/order").as("createOrder");

    // Submit the order
    cy.contains("Підтвердити замовлення").click();

    // Verify that the server rejects the invalid address
    cy.wait("@createOrder").then((interception) => {
      expect(interception.response.statusCode).to.eq(400);
    });

    // Verify that the processing state disappears
    cy.contains("Обробка...").should("not.exist");

    // Verify that the submit button returns to its normal state
    cy.contains("Підтвердити замовлення")
      .should("be.visible")
      .and("be.enabled");

    // Verify that the user remains on the checkout page
    cy.url().should("include", "/checkout");
  });

  // BUG-10 — Product search is case-sensitive-------------------------------------------------------------------
  it("should find products regardless of letter case", () => {
    cy.visit("http://localhost:3000");

    // Test different letter cases in the search field
    const searchQueries = ["джинси", "Джинси", "дЖинси"];

    searchQueries.forEach((query) => {
      // Enter the search query
      cy.get('input[placeholder="Пошук за назвою..."]')
        .clear()
        .type(query)
        .should("have.value", query);

      // Verify that the matching product is displayed
      cy.contains("Сині джинси").should("be.visible");
    });
  });
});
