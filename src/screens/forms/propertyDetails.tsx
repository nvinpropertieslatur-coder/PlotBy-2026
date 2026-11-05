// @ts-nocheck
import React, { useMemo, useState } from "react";
import { AgricultureListingFields } from "../../browse/features/agriculture/AgricultureOptions";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import styles from "./addpropertyStyle";
import { calculateLandRate } from "./landRateCalculator";

export default function PropertyDetailsStep({
  propertyType = "plot",
  data,
  onChange,
}) {
  const [showTotalRate, setShowTotalRate] = useState(false);

  // UPDATE PROPERTY DATA
  const update = (key, value) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  // AGRICULTURAL LAND DETAILS
  if (propertyType === "agriculturalLand") {
    const pricing = calculateLandRate({
      acres: data.acres,
      guntha: data.gunta,
      ratePerAcre: data.ratePerAcre,
      discount: data.landDiscount,
      discountType: "percentage",
    });

    const choices = (key, values) => (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {values.map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() =>
              update(
                key,
                key === "discountType"
                  ? value
                  : data[key] === value
                  ? ""
                  : value
              )
            }
            style={{
              paddingHorizontal: 16,
              paddingVertical: 11,
              borderRadius: 18,
              borderWidth: 1,
              borderColor:
                (data[key] ||
                  (key === "discountType" ? "fixed" : "")) === value
                  ? "#8CFF32"
                  : "#444",
              backgroundColor:
                (data[key] ||
                  (key === "discountType" ? "fixed" : "")) === value
                  ? "#26351C"
                  : "#151515",
            }}
          >
            <Ionicons
              name={
                key === "landType"
                  ? value === "Kali"
                    ? "leaf-outline"
                    : "sunny-outline"
                  : "trail-sign-outline"
              }
              size={18}
              color="#8CFF32"
            />
            <Text style={{ color: "#fff" }}>{value}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );

    const field = (label, key, placeholder, numeric = false) => (
      <>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#777"
          keyboardType={numeric ? "decimal-pad" : "default"}
          value={data[key] || ""}
          onChangeText={(value) => update(key, value)}
        />
      </>
    );

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="leaf-outline" size={20} color="#000" />
          </View>
          <Text style={styles.sectionTitle}>Sheti Details</Text>
        </View>

        <Text style={styles.label}>Road Access</Text>
        {choices("roadType", ["Samaik", "Kachha Road", "Dambari"])}

        <Text style={styles.label}>Land Area</Text>

        <View style={styles.areaRow}>
          <View style={styles.areaInput}>
            <TextInput
              style={styles.areaTextInput}
              placeholder="Acres"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={data.acres || ""}
              onChangeText={(value) =>
                update("acres", value.replace(/[^0-9.]/g, ""))
              }
            />
            <Text style={styles.ft}>acre</Text>
          </View>

          <View style={styles.areaInput}>
            <TextInput
              style={styles.areaTextInput}
              placeholder="Guntha"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={data.gunta || ""}
              onChangeText={(value) =>
                update("gunta", value.replace(/[^0-9.]/g, ""))
              }
            />
            <Text style={styles.ft}>guntha</Text>
          </View>
        </View>

        {field("Rate per acre", "ratePerAcre", "Enter rate per acre", true)}

        <View
          style={{
            padding: 16,
            marginTop: 8,
            borderRadius: 16,
            backgroundColor: "#191f1b",
            borderWidth: 1,
            borderColor: "#38443b",
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 14 }}>Total Rate</Text>
          <Text
            style={{
              color: "#8CFF32",
              fontSize: 22,
              fontWeight: "800",
              marginTop: 6,
            }}
          >
            ₹ {pricing.basicPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {field("Discount (%)", "landDiscount", "Enter discount percentage", true)}

        <View
          style={{
            padding: 16,
            marginBottom: 20,
            borderRadius: 16,
            backgroundColor: "#191f1b",
            borderWidth: 1,
            borderColor: "#38443b",
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 14 }}>
            Calculated Rate After Discount
          </Text>
          <Text
            style={{
              color: "#8CFF32",
              fontSize: 22,
              fontWeight: "800",
              marginTop: 6,
            }}
          >
            ₹ {pricing.finalPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <Text style={styles.label}>Jamin Type</Text>
        {choices("landType", ["Kali", "Malran"])}

        <Text style={styles.sectionTitle}>Water Sources</Text>

        {[
          ["Borewell (Bor)", "water-outline"],
          ["Well (Vihir)", "ellipse-outline"],
          ["Canal", "git-branch-outline"],
        ].map(([label, icon]) => {
          const sources = data.waterSources || [];
          const index = sources.findIndex(
            (source) => source.type === label
          );
          const selected = index >= 0;
          const source = selected ? sources[index] : null;

          const updateSource = (patch) =>
            update(
              "waterSources",
              sources.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...patch } : item
              )
            );

          return (
            <View key={label} style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    update(
                      "waterSources",
                      selected
                        ? sources.filter((item) => item.type !== label)
                        : [...sources, { type: label, quantity: "1" }]
                    )
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  style={{
                    width: 30,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={selected ? "checkbox" : "square-outline"}
                    size={23}
                    color={selected ? "#8CFF32" : "#aaa"}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: selected ? "#8CFF32" : "#444",
                    paddingLeft: 14,
                    paddingRight: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <Ionicons
                      name={icon}
                      size={18}
                      color={selected ? "#8CFF32" : "#aaa"}
                    />
                    <Text style={{ color: "#fff" }}>{label}</Text>
                  </View>

                  {selected && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          updateSource({
                            quantity: String(
                              Math.max(
                                1,
                                (Number(source.quantity) || 1) - 1
                              )
                            ),
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease ${label} quantity`}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 17,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#8CFF32" />
                      </TouchableOpacity>

                      <Text
                        style={{
                          color: "#fff",
                          minWidth: 18,
                          textAlign: "center",
                          fontWeight: "700",
                        }}
                      >
                        {Number(source.quantity) || 1}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          updateSource({
                            quantity: String(
                              (Number(source.quantity) || 1) + 1
                            ),
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Increase ${label} quantity`}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 17,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="add" size={20} color="#8CFF32" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {!selected && (
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color="#8CFF32"
                    />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // LENGTH
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

  // WIDTH
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

  // TOTAL AREA
  const totalArea = parseFloat(data.totalArea) || 0;
  const rate = parseFloat(data.rate) || 0;

  const discountRate =
    data.discount === "yes"
      ? parseFloat(data.discountRate) || 0
      : 0;

  // TOTAL AMOUNT
  const totalRate = totalArea * (rate - discountRate);

  // FORMAT INDIAN AMOUNT
  const formatIndianAmount = (amount) => {
    const value = Number(amount) || 0;

    if (value >= 10000000) {
      const crore = value / 10000000;
      return `${crore % 1 === 0 ? crore : crore.toFixed(2)} Crore`;
    }

    if (value >= 100000) {
      const lakh = value / 100000;
      return `${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} Lakh`;
    }

    if (value >= 1000) {
      const thousand = value / 1000;
      return `${thousand % 1 === 0 ? thousand : thousand.toFixed(2)} Thousand`;
    }

    return value.toFixed(2);
  };

  // FACING
  const toggleFacing = (index) => {
    const updatedFacing = [...(data.facing || [])];

    updatedFacing[index] = {
      ...updatedFacing[index],
      selected: !updatedFacing[index].selected,
    };

    update("facing", updatedFacing);
  };

  const handleFacingText = (index, text) => {
    const updatedFacing = [...(data.facing || [])];

    updatedFacing[index] = {
      ...updatedFacing[index],
      value: text,
    };

    update("facing", updatedFacing);
  };

  // PROPERTY TYPE NAME
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

  // NORMAL PROPERTY UI
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name="home-outline" size={20} color="#000" />
        </View>

        <Text style={styles.sectionTitle}>Property Details</Text>
      </View>

      <Text style={styles.label}>Area*</Text>

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

          <Text style={styles.ft}>ft</Text>
        </View>

        <View style={styles.areaInput}>
          <TextInput
            style={styles.areaTextInput}
            placeholder="Width"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={data.width || ""}
            onChangeText={handleWidthChange}
          />

          <Text style={styles.ft}>ft</Text>
        </View>
      </View>

      <Text style={styles.label}>Total Area*</Text>

      <View style={styles.inputWithIcon}>
        <Ionicons name="resize-outline" size={20} color="#8CFF32" />

        <TextInput
          style={styles.iconInput}
          placeholder="Total Area"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={data.totalArea || ""}
          onChangeText={(text) => update("totalArea", text)}
        />

        <Text style={styles.ft}>sqft</Text>
      </View>

      <Text style={styles.label}>Rate per sqft*</Text>

      <View style={styles.inputWithIcon}>
        <Text style={styles.currencySymbol}>₹</Text>

        <TextInput
          style={styles.iconInput}
          placeholder="Enter rate per sqft"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={data.rate || ""}
          onChangeText={(text) => update("rate", text)}
        />

        <Text style={styles.ft}>sqft</Text>
      </View>

      <Text style={styles.label}>Discount*</Text>

      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioItem}
          onPress={() => update("discount", "yes")}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.radio,
              data.discount === "yes" && styles.radioSelected,
            ]}
          >
            {data.discount === "yes" && (
              <View style={styles.radioDot} />
            )}
          </View>

          <Text style={styles.radioText}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioItem}
          onPress={() =>
            onChange({
              ...data,
              discount: "no",
              discountRate: "",
            })
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.radio,
              data.discount !== "yes" && styles.radioSelected,
            ]}
          >
            {data.discount !== "yes" && (
              <View style={styles.radioDot} />
            )}
          </View>

          <Text style={styles.radioText}>No</Text>
        </TouchableOpacity>
      </View>

      {data.discount === "yes" && (
        <>
          <Text style={styles.label}>Discount Rate</Text>

          <View style={styles.inputWithIcon}>
            <Ionicons name="pricetag-outline" size={20} color="#8CFF32" />

            <TextInput
              style={styles.iconInput}
              placeholder="Enter discount"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={data.discountRate || ""}
              onChangeText={(text) =>
                update("discountRate", text)
              }
            />

            <Text style={styles.ft}>sqft</Text>
          </View>
        </>
      )}

      <Text style={styles.label}>Total Amount</Text>

      <TouchableOpacity
        style={styles.totalRateBox}
        onPress={() => setShowTotalRate(!showTotalRate)}
        activeOpacity={0.8}
      >
        {showTotalRate ? (
          <Text style={styles.totalRateText}>
            ₹ {formatIndianAmount(totalRate)}
          </Text>
        ) : (
          <Ionicons name="cash-outline" size={24} color="#8CFF32" />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Facing*</Text>

      {(data.facing || []).map((item, index) => (
        <View
          key={item.direction}
          style={styles.facingRowContainer}
        >
          <TouchableOpacity
            style={styles.facingRow}
            onPress={() => toggleFacing(index)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                item.selected && styles.checkedCheckbox,
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

            <Text style={styles.facingText}>
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
                handleFacingText(index, text)
              }
            />
          )}
        </View>
      ))}

      <Text style={styles.label}>Social Media Link</Text>

      <View style={styles.inputWithIcon}>
        <Ionicons name="link-outline" size={20} color="#8CFF32" />

        <TextInput
          style={styles.iconInput}
          placeholder="Enter social media link"
          placeholderTextColor="#666"
          keyboardType="url"
          autoCapitalize="none"
          value={data.socialMediaLink || ""}
          onChangeText={(text) =>
            update("socialMediaLink", text)
          }
        />
      </View>

      {propertyType === "agriculturalLand" && (
        <AgricultureListingFields
          value={data.agricultureDetails}
          onChange={(details) =>
            update("agricultureDetails", details)
          }
        />
      )}

      <View style={{ height: 15 }} />
    </ScrollView>
  );
}