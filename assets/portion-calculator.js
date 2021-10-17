class PortionCalculatorForm extends HTMLElement {
  constructor() {
    super();
    this.querySelector('form').addEventListener('submit', this.onSubmitHandler.bind(this));
    console.log('starting');
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const obj = Object.fromEntries(formData.entries());

    const productSelection = 'lamb';
    const petWeight = parseInt(obj['pet-weight'].split('-')[0]); // Take first number of the range
    const petSize = obj['pet-size'];
    const portion = parseFloat(obj['portion']);

    const caloriesPerDay = getDailyCalorieCount(
      productSelection,
      petWeight,
      petSize,
      portion
    );

    const unitsPerDay = getUnitsPerDay(caloriesPerDay, productSelection);
    console.log(unitsPerDay)

    const roundedUnitsPerDayByQuarter = (Math.round(unitsPerDay * 4) / 4).toFixed(2);

    console.log(form.querySelector('#daily-unit-recommendation'));
    form.querySelector('#daily-unit-recommendation').innerText = roundedUnitsPerDayByQuarter;
    form.querySelector('#recommendation-banner').classList.remove("hidden");

    console.log(roundedUnitsPerDayByQuarter);
   
  }
}

customElements.define('portion-calculator-form', PortionCalculatorForm);

/**
 * Base calorie count per product
 * TODO: Change this back to true values when we can change product and recalculate # of days to send product
 */
 const caloriesPerUnit = Object.freeze({
  lamb: 470,
  turkey: 470,
  beef: 470,
});

/**
 * This is a memoized calorie lookup object based on weight categories defined in mapWeight.
 * All values are at 100% portion sizes.
 *
 * TODO: Add mapping of other food types besides lamb.
 */
const caloriesNeeded = Object.freeze({
  lamb: {
    a: {
      normal: 80,
      over: 72,
      under: 88,
    },
    b: {
      normal: 165,
      over: 149,
      under: 182,
    },
    c: {
      normal: 230,
      over: 207,
      under: 253,
    },
    d: {
      normal: 325,
      over: 293,
      under: 358,
    },
    e: {
      normal: 435,
      over: 392,
      under: 479,
    },
    f: {
      normal: 544,
      over: 490,
      under: 598,
    },
    g: {
      normal: 655,
      over: 590,
      under: 721,
    },
    h: {
      normal: 754,
      over: 679,
      under: 829,
    },
    i: {
      normal: 841,
      over: 757,
      under: 925,
    },
    j: {
      normal: 939,
      over: 845,
      under: 1033,
    },
    k: {
      normal: 1050,
      over: 945,
      under: 1155,
    },
    l: {
      normal: 1180,
      over: 1062,
      under: 1298,
    },
    m: {
      normal: 1330,
      over: 1197,
      under: 1463,
    },
    n: {
      normal: 1484,
      over: 1336,
      under: 1632,
    },
    o: {
      normal: 1630,
      over: 1467,
      under: 1793,
    },
  },
});

/**
 * Package size from the manufacturer
 */
 const standardPackageSize = 18;

/**
 * Kitting size defined in Flow.space
 */
 const standardKittingMultiple = 6;

/**
 * Smallest size kit we allow to be shipped.
 */
 const minimumPackageSize = 6;

/**
 * Largest size kit we allow to be shipped.
 */
 const maximumPackageSize = 108;

/**
 * Smallest frequency (in days) that we allow for shipping intervals
 */
 const minimumShippingFrequency = 14;

/**
 * Largest frequency (in days) that we allow for shipping intervals
 */
 const maximumShippingFrequency = 42;

/**
 * Maps the weight range into a single variable for ease of lookup.
 * @param {Number} weight wight of the pet
 */
const mapWeight = (weight) => {
  if (weight <= 0) {
    throw new Error("Not possible");
  }
  if (weight <= 3) {
    return "a";
  } else if (weight <= 6) {
    return "b";
  } else if (weight <= 9) {
    return "c";
  } else if (weight <= 15) {
    return "d";
  } else if (weight <= 21) {
    return "e";
  } else if (weight <= 28) {
    return "f";
  } else if (weight <= 35) {
    return "g";
  } else if (weight <= 41) {
    return "h";
  } else if (weight <= 47) {
    return "i";
  } else if (weight <= 55) {
    return "j";
  } else if (weight <= 65) {
    return "k";
  } else if (weight <= 76) {
    return "l";
  } else if (weight <= 88) {
    return "m";
  } else if (weight <= 101) {
    return "n";
  } else if (weight <= 115) {
    return "o";
  } else {
    throw new Error("Out of range. We do not calculate that high");
  }
};

/**
 *
 * @param {String} product name of the product
 * @param {Number} weight weight of the pete
 * @param {String} dogSize options for the dog's size (available options are: 'under', 'normal', 'over')
 * @param {Number} portion Portion size (1 = 100%, 0.5 = 50%, etc)
 */
 const getDailyCalorieCount = (
  product = "lamb",
  weight = 45,
  dogSize = "normal",
  portion = 0.5
) => {
  try {
    const weightMapValue = mapWeight(weight);
    // For now, we are hardcoding the turkey to have 'lamb' values because there isn't specific data for turkey
    return caloriesNeeded["lamb"][weightMapValue][dogSize] * portion;
  } catch (err) {
    console.error(err);
    return -1;
  }
};

/**
 *
 * @param {Number} calorieRequirement Number of calories a dog needs in their daily diet
 * @param {String} product The name of the product
 * @param {Number} numOfUnits Number of cans / units you are purchasing
 */
 const getDaysOfFood = (
  calorieRequirement,
  product = "lamb",
  numOfUnits
) => Math.floor((caloriesPerUnit[product] * numOfUnits) / calorieRequirement);

/**
 *
 * @param {*} dailyCalorieCount
 * @param {*} product
 */
 const getUnitsPerDay = (dailyCalorieCount, product) =>
  dailyCalorieCount / caloriesPerUnit[product];

 const getFluidOuncesPerDay = (unitsPerDay, unitFluidOunces) =>
  unitsPerDay * unitFluidOunces;

 const getUnitsPerMonth = (unitsPerDay) => unitsPerDay * 30;

 const getPackageSize = (units) =>
  units < standardPackageSize ? units : standardPackageSize;

/**
 * Units need to fit in multiples of the package size
 * @param {Number} unitCount # of units
 * @returns Correct package size to ship
 */
 const roundUnitsToPackageSize = (unitCount) => {
  return unitCount > standardPackageSize
    ? Math.round(unitCount / standardPackageSize) * standardPackageSize
    : Math.round(unitCount / standardKittingMultiple) * standardKittingMultiple;
};

/**
 * Calculates the adjusted units to fit in a package
 * @param {Number} unitsPerMonth # of units
 * @returns # of units and frequency of shipment
 */
 const getRoundedUnitsPerMonthObj = (unitsPerMonth) => {
  let adjustedPackageSize = standardPackageSize;
  let roundedNumberOfUnits =
    Math.round(unitsPerMonth / adjustedPackageSize) * adjustedPackageSize;
  let roundedRatio = unitsPerMonth / roundedNumberOfUnits;
  let shippingFrequencyInDays = 30 / roundedRatio;

  // Adjust the counts to make it more manageable for the user
  while (
    adjustedPackageSize > standardKittingMultiple &&
    (roundedNumberOfUnits < standardPackageSize ||
      shippingFrequencyInDays > maximumShippingFrequency)
  ) {
    adjustedPackageSize = adjustedPackageSize - standardKittingMultiple;
    roundedNumberOfUnits =
      Math.round(unitsPerMonth / adjustedPackageSize) * adjustedPackageSize;
    roundedRatio = unitsPerMonth / roundedNumberOfUnits;
    shippingFrequencyInDays = 30 / roundedRatio;
  }

  return {
    units: roundedNumberOfUnits,
    dailyFrequency: shippingFrequencyInDays,
  };
};

const {
  images: {
    wizardForm: {
      stepThree: { oneWeekCal, twoWeekCal, fourWeekCal },
    },
  },
} = window.liquidVariables;

/**
 * Creates options for shipping frequency based on a standard shipping window
 * @param {Number} units
 * @param {Number} unitsNeedPerDay
 * @param {Number} shippingIntervalFrequency
 * @returns UI data for choosing shipping frequency
 */
 const getPossibleShippingFrequencies = (
  units,
  unitsNeedPerDay,
  shippingIntervalFrequency
) => {
  if (units < standardPackageSize) {
    const recommendedFrequency = Math.floor(shippingIntervalFrequency);
    return [
      {
        label: "Recommended",
        shippingIntervalFrequency: recommendedFrequency,
        iconSrc: twoWeekCal,
      },
    ];
  }

  let possibleShippingFrequencies = [];

  const lowerUnits = units - standardPackageSize;
  const lowerFrequency = Math.floor(lowerUnits / unitsNeedPerDay);
  if (
    lowerUnits > minimumPackageSize &&
    lowerUnits < maximumPackageSize &&
    lowerFrequency >= minimumShippingFrequency
  ) {
    possibleShippingFrequencies.push({
      label: "Small",
      shippingIntervalFrequency: lowerFrequency,
      iconSrc: oneWeekCal,
    });
  }

  const recommendedFrequency = Math.floor(shippingIntervalFrequency);

  possibleShippingFrequencies.push({
    label: "Recommended",
    shippingIntervalFrequency: recommendedFrequency,
    iconSrc: twoWeekCal,
  });

  const upperUnits = units + standardPackageSize;
  const upperFrequency = Math.floor(upperUnits / unitsNeedPerDay);
  if (
    upperUnits > minimumPackageSize &&
    upperUnits < maximumPackageSize &&
    upperFrequency <= maximumShippingFrequency
  ) {
    possibleShippingFrequencies.push({
      label: "Large",
      shippingIntervalFrequency: upperFrequency,
      iconSrc: fourWeekCal,
    });
  }

  return possibleShippingFrequencies;
};

/**
 * Calculates quantity of a standard package size
 * @param {Number} units Number of units
 * @returns Quantity
 */
 const getPackageQuantity = (units) => {
  let quantity = Math.floor(units / standardPackageSize);
  if (quantity < 1) {
    quantity = 1;
  }
  return quantity;
};

 const getFoodOunces = (
  productSelection,
  petWeight,
  petSize,
  foodPortion
) => {
  if (productSelection && petWeight && petSize && foodPortion) {
    const caloriesPerDay = getDailyCalorieCount(
      productSelection,
      petWeight,
      petSize,
      foodPortion
    );
    const unitsPerDay = getUnitsPerDay(caloriesPerDay, productSelection);
    const foodOunces = getFluidOuncesPerDay(unitsPerDay, 16);

    return foodOunces;
  }
};

/**
 * Calculates the appropriate store product variant to put in the cart
 * @param {Object[]} products List of store products
 * @param {Number} shippingFrequency Frequency between order charges
 * @param {Number} unitsPerDay Required units per day
 * @param {String} productSelection Selected product from store products
 * @returns Store product variant
 */
 const getSelectedProductVariant = (
  products,
  shippingFrequency,
  unitsPerDay,
  productSelection
) => {
  if (products && products.length > 0 && shippingFrequency) {
    // Once we have the defined frequency, we can recalculate the number of units
    let timeAdjustedUnits = roundUnitsToPackageSize(
      shippingFrequency * unitsPerDay
    );

    // Enable these when you want to restrict the package size to maximum of 18
    /*
        const quantity = getPackageQuantity(timeAdjustedUnits);
        const packageSize = getPackageSize(timeAdjustedUnits);
        */
    const packageSize = timeAdjustedUnits;

    // Find the correct variant based on new unit count
    const [selectedProduct] = products.filter(
      (product) => product.handle === productSelection
    );
    const { variants } = selectedProduct;
    const [productVariant] = variants.filter((variant) => {
      return (
        parseInt(variant.option1, 10) === packageSize ||
        parseInt(variant.option2, 10) === packageSize ||
        parseInt(variant.option3, 10) === packageSize
      );
    });

    return productVariant;
  }
};

/**
 * Transforms pet object information into cart object information
 * @param {Object[]} pets Pet objects
 * @param {Object[]} products Store product objects
 * @returns List of cart items
 */
 const getPetsAsCartItems = (pets, products) => {
  // Items to be added to cart
  const items = [];

  pets.forEach((pet) => {
    const {
      foodPortion,
      shippingIntervalUnitType,
      petID,
      petName,
      breedName,
      petFoodTypes,
      petWeight,
      petSize,
      productSelection,
      mealFrequency,
      shippingIntervalFrequency,
    } = pet;

    const caloriesPerDay = getDailyCalorieCount(
      productSelection,
      petWeight,
      petSize,
      foodPortion
    );
    const unitsPerDay = getUnitsPerDay(caloriesPerDay, productSelection);

    const { id: selectedProductVariantId } = getSelectedProductVariant(
      products,
      shippingIntervalFrequency,
      unitsPerDay,
      productSelection
    );

    const foodOunces = getFoodOunces(
      productSelection,
      petWeight,
      petSize,
      foodPortion
    );

    items.push({
      id: selectedProductVariantId,
      quantity: 1,
      properties: {
        shipping_interval_frequency: shippingIntervalFrequency,
        shipping_interval_unit_type: shippingIntervalUnitType,
        petID,
        petName,
        breedName,
        petFoodTypes,
        petWeight,
        petSize,
        mealFrequency,
        foodPortion,
        orderType: "recurring",
        foodOunces,
      },
    });
  });

  return items;
};
