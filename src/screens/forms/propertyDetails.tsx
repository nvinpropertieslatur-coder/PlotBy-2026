// @ts-nocheck
import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles from "./addpropertyStyle";

export default function PropertyDetailsStep({
  propertyType = "plot",
  data,
  onChange,
}) {
  const [showTotalRate, setShowTotalRate] = useState(false);

  // ============================================================
  // UPDATE PROPERTY DATA
  // ============================================================

  const update = (key, value) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  // ============================================================
  // LENGTH
  // ============================================================

  const handleLengthChange = (text) => {
    const updatedData = {
      ...data,
      length: text,
    };

    const length = parseFloat(text);
    const width = parseFloat(data.width);

    if (!isNaN(length) && !isNaN(width)) {
      updatedData.totalArea = String(length * width);
    } else {
      updatedData.totalArea = "";
    }

    onChange(updatedData);
  };

  // ============================================================
  // WIDTH
  // ============================================================

  const handleWidthChange = (text) => {
    const updatedData = {
      ...data,
      width: text,
    };

    const length = parseFloat(data.length);
    const width = parseFloat(text);

    if (!isNaN(length) && !isNaN(width)) {
      updatedData.totalArea = String(length * width);
    } else {
      updatedData.totalArea = "";
    }

    onChange(updatedData);
  };

  // ============================================================
  // TOTAL AREA
  // ============================================================

  const totalArea = parseFloat(data.totalArea) || 0;

  const rate = parseFloat(data.rate) || 0;

  const discountRate =
    data.discount === "yes"
      ? parseFloat(data.discountRate) || 0
      : 0;

  // ============================================================
  // TOTAL AMOUNT
  // ============================================================

  const totalRate = useMemo(() => {
    return totalArea * (rate - discountRate);
  }, [totalArea, rate, discountRate]);

  // ============================================================
  // FORMAT INDIAN AMOUNT
  // ============================================================

  const formatIndianAmount = (amount) => {
    const value = Number(amount) || 0;

    if (value >= 10000000) {
      const crore = value / 10000000;

      return `${crore % 1 === 0
        ? crore
        : crore.toFixed(2)} Crore`;
    }

    if (value >= 100000) {
      const lakh = value / 100000;

      return `${lakh % 1 === 0
        ? lakh
        : lakh.toFixed(2)} Lakh`;
    }

    if (value >= 1000) {
      const thousand = value / 1000;

      return `${thousand % 1 === 0
        ? thousand
        : thousand.toFixed(2)} Thousand`;
    }

    return value.toFixed(2);
  };

  // ============================================================
  // FACING
  // ============================================================

  const toggleFacing = (index) => {
    const updatedFacing = [
      ...(data.facing || []),
    ];

    updatedFacing[index] = {
      ...updatedFacing[index],
      selected:
        !updatedFacing[index].selected,
    };

    update("facing", updatedFacing);
  };

  const handleFacingText = (index, text) => {
    const updatedFacing = [
      ...(data.facing || []),
    ];

    updatedFacing[index] = {
      ...updatedFacing[index],
      value: text,
    };

    update("facing", updatedFacing);
  };

  // ============================================================
  // PROPERTY TYPE NAME
  // ============================================================

  const getPropertyTypeName = () => {
    if (propertyType === "agriculturalLand") {
      return "Agricultural Land";
    }

    if (!propertyType) {
      return "Property";
    }

    return (
      propertyType.charAt(0).toUpperCase() +
      propertyType.slice(1)
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* ======================================================
          SECTION HEADER
      ====================================================== */}

      <View style={styles.sectionHeader}>

        <View style={styles.sectionIcon}>
          <Ionicons
            name="home-outline"
            size={20}
            color="#000"
          />
        </View>

        <Text style={styles.sectionTitle}>
          Property Details
        </Text>

      </View>

      {/* ======================================================
          PROPERTY TYPE
      ====================================================== */}

      {/* <View style={styles.propertyTypeBadge}>


        <Text style={styles.propertyTypeText}>
          {getPropertyTypeName()}
        </Text>

      </View> */}

      {/* ======================================================
          AREA
      ====================================================== */}

      <Text style={styles.label}>
        Area*
      </Text>

      <View style={styles.areaRow}>

        <View style={styles.areaInput}>

          <TextInput
            style={styles.areaTextInput}
            placeholder="Length"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={data.length || ""}
            onChangeText={handleLengthChange}
          />

          <Text style={styles.ft}>
            ft
          </Text>

        </View>

        {/* ==================================================
            WIDTH
        ================================================== */}

        <View style={styles.areaInput}>

          <TextInput
            style={styles.areaTextInput}
            placeholder="Width"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={data.width || ""}
            onChangeText={handleWidthChange}
          />

          <Text style={styles.ft}>
            ft
          </Text>

        </View>

      </View>

      {/* ======================================================
          TOTAL AREA
      ====================================================== */}

      <Text style={styles.label}>
        Total Area*
      </Text>

      <View style={styles.inputWithIcon}>

        <Ionicons
          name="resize-outline"
          size={20}
          color="#8CFF32"
        />

        <TextInput
          style={styles.iconInput}
          placeholder="Total Area"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={data.totalArea || ""}
          onChangeText={(text) =>
            update("totalArea", text)
          }
        />

        <Text style={styles.ft}>
          sqft
        </Text>

      </View>

      {/* ======================================================
          RATE PER SQFT
      ====================================================== */}

      <Text style={styles.label}>
        Rate per sqft*
      </Text>

      <View style={styles.inputWithIcon}>

        <Text style={styles.currencySymbol}>
          ₹
        </Text>

        <TextInput
          style={styles.iconInput}
          placeholder="Enter rate per sqft"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={data.rate || ""}
          onChangeText={(text) =>
            update("rate", text)
          }
        />

        <Text style={styles.ft}>
          sqft
        </Text>

      </View>

      {/* ======================================================
          DISCOUNT
      ====================================================== */}

      <Text style={styles.label}>
        Discount*
      </Text>

      <View style={styles.radioContainer}>

        {/* YES */}

        <TouchableOpacity
          style={styles.radioItem}
          onPress={() =>
            update("discount", "yes")
          }
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.radio,
              data.discount === "yes" &&
                styles.radioSelected,
            ]}
          >

            {data.discount === "yes" && (
              <View style={styles.radioDot} />
            )}

          </View>

          <Text style={styles.radioText}>
            Yes
          </Text>

        </TouchableOpacity>

        {/* NO */}

        <TouchableOpacity
          style={styles.radioItem}
          onPress={() => {
            onChange({
              ...data,
              discount: "no",
              discountRate: "",
            });
          }}
          activeOpacity={0.8}
        >

          <View
            style={[
              styles.radio,
              data.discount !== "yes" &&
                styles.radioSelected,
            ]}
          >

            {data.discount !== "yes" && (
              <View style={styles.radioDot} />
            )}

          </View>

          <Text style={styles.radioText}>
            No
          </Text>

        </TouchableOpacity>

      </View>

      {/* ======================================================
          DISCOUNT RATE
      ====================================================== */}

      {data.discount === "yes" && (
        <>

          <Text style={styles.label}>
            Discount Rate
          </Text>

          <View style={styles.inputWithIcon}>

            <Ionicons
              name="pricetag-outline"
              size={20}
              color="#8CFF32"
            />

            <TextInput
              style={styles.iconInput}
              placeholder="Enter discount"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={
                data.discountRate || ""
              }
              onChangeText={(text) =>
                update(
                  "discountRate",
                  text
                )
              }
            />

            <Text style={styles.ft}>
              sqft
            </Text>

          </View>

        </>
      )}

      {/* ======================================================
          TOTAL AMOUNT
      ====================================================== */}

      <Text style={styles.label}>
        Total Amount
      </Text>

      <TouchableOpacity
        style={styles.totalRateBox}
        onPress={() =>
          setShowTotalRate(!showTotalRate)
        }
        activeOpacity={0.8}
      >
        {showTotalRate ? (
          <Text style={styles.totalRateText}>
            ₹ {formatIndianAmount(totalRate)}
          </Text>
        ) : (
          <Ionicons
            name="cash-outline"
            size={24}
            color="#8CFF32"
          />
        )}
      </TouchableOpacity>

      {/* ======================================================
          FACING
      ====================================================== */}

      <Text style={styles.label}>
        Facing*
      </Text>

      {(data.facing || []).map(
        (item, index) => (

          <View
            key={item.direction}
            style={
              styles.facingRowContainer
            }
          >

            <TouchableOpacity
              style={styles.facingRow}
              onPress={() =>
                toggleFacing(index)
              }
              activeOpacity={0.8}
            >

              <View
                style={[
                  styles.checkbox,
                  item.selected &&
                    styles.checkedCheckbox,
                ]}
              >

                {item.selected && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color="#000"
                  />
                )}

              </View>

              <Text
                style={styles.facingText}
              >
                {item.direction}
              </Text>

            </TouchableOpacity>

            {item.selected && (
              <TextInput
                style={styles.facingInput}
                placeholder="Enter facing details"
                placeholderTextColor="#666"
                value={item.value || ""}
                onChangeText={(text) =>
                  handleFacingText(
                    index,
                    text
                  )
                }
              />
            )}

          </View>

        )
      )}

      {/* ======================================================
          SOCIAL MEDIA LINK
      ====================================================== */}

      <Text style={styles.label}>
        Social Media Link
      </Text>

      <View style={styles.inputWithIcon}>

        <Ionicons
          name="link-outline"
          size={20}
          color="#8CFF32"
        />

        <TextInput
          style={styles.iconInput}
          placeholder="Enter social media link"
          placeholderTextColor="#666"
          keyboardType="url"
          autoCapitalize="none"
          value={
            data.socialMediaLink || ""
          }
          onChangeText={(text) =>
            update(
              "socialMediaLink",
              text
            )
          }
        />

      </View>

      <View style={{ height: 15 }} />

    </ScrollView>
  );
}