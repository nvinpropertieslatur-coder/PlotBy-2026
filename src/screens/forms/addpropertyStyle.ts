// @ts-nocheck
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ============================================================
  // MAIN SCREEN
  // ============================================================

  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  propertyTypeBadge: {
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",

  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#8CFF32",

  borderRadius: 20,

  paddingHorizontal: 16,
  paddingVertical: 9,

  marginBottom: 18,
},


propertyTypeText: {
  color: "#8CFF32",
  fontSize: 14,
  fontWeight: "700",
},

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  // ============================================================
  // HEADER
  // ============================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 15,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 5,
  },

  // ============================================================
  // STEP INDICATOR
  // ============================================================

  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },

  stepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8CFF32",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#8CFF32",
    alignItems: "center",
    justifyContent: "center",
  },

  stepActiveText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },

  stepText: {
    color: "#777",
    fontSize: 14,
    fontWeight: "600",
  },

  stepLine: {
    width: 55,
    height: 2,
    backgroundColor: "#333",
    marginHorizontal: 8,
  },

  activeLine: {
    width: 55,
    height: 2,
    backgroundColor: "#8CFF32",
    marginHorizontal: 8,
  },

  // ============================================================
  // SECTION HEADER
  // ============================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8CFF32",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },

  // ============================================================
  // LABEL
  // ============================================================

  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },

  // ============================================================
  // INPUT
  // ============================================================

  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    fontSize: 14,
  },

  inputWithIcon: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  iconInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 0,
  },

  currencySymbol: {
    color: "#8CFF32",
    fontSize: 21,
    fontWeight: "600",
  },

  unitText: {
    color: "#666",
    fontSize: 13,
  },

  // ============================================================
  // TWO COLUMN ROW
  // ============================================================

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  // ============================================================
  // RADIO
  // ============================================================

  radioContainer: {
    flexDirection: "row",
    gap: 30,
    marginTop: 5,
  },

  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  radioSelected: {
    borderColor: "#8CFF32",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#8CFF32",
  },

  radioText: {
    color: "#fff",
    fontSize: 14,
  },

  // ============================================================
  // TOTAL AMOUNT
  // ============================================================

  totalRateBox: {
    height: 52,
    width: "100%",
    borderWidth: 1,
    borderColor: "#8CFF32",
    borderRadius: 10,
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  totalRateText:{
    color : "#fff"
  },

  totalRateValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },

  // ============================================================
  // FACING
  // ============================================================

  facingRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },

  facingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkedCheckbox: {
    backgroundColor: "#8CFF32",
    borderColor: "#8CFF32",
  },

  facingText: {
    color: "#fff",
    fontSize: 14,
  },

  facingInput: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 12,
    marginLeft: 15,
    fontSize: 14,
  },

  // ============================================================
  // ADDRESS
  // ============================================================

  addressInput: {
    width: "100%",
    height: 90,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 14,
  },

  // ============================================================
  // DROPDOWN
  // ============================================================

  dropdown: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "#111",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownText: {
    color: "#fff",
    fontSize: 14,
  },

  dropdownMenu: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    marginTop: 5,
    overflow: "hidden",
  },

  cityOption: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#252525",
  },

  cityText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  districtText: {
    color: "#666",
    fontSize: 11,
    marginTop: 2,
  },

  // ============================================================
  // MAP
  // ============================================================

  mapButton: {
    height: 48,
    borderWidth: 1,
    borderColor: "#8CFF32",
    borderRadius: 10,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mapButtonText: {
    color: "#8CFF32",
    fontSize: 14,
    fontWeight: "600",
  },

  selectedLocationBox: {
    width: "100%",
    alignSelf: "stretch",
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#151a16",
    borderWidth: 1,
    borderColor: "#2E552E",
    overflow: "hidden",
  },

  selectedLocationHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  selectedLocationTitle: {
    flex: 1,
    flexShrink: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  coordinateText: {
    width: "100%",
    color: "#B8BDB9",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },

  // ============================================================
  // UPLOAD
  // ============================================================

  uploadBox: {
    height: 120,
    borderWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadText: {
    color: "#777",
    marginTop: 8,
    fontSize: 14,
  },

  areaRow: {
  flexDirection: "row",
  width: "100%",
  gap: 10,
},

areaInput: {
  flex: 1,
  minWidth: 0,
  height: 52,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#2A2A2A",
  borderRadius: 12,
  paddingHorizontal: 10,
},

areaTextInput: {
  flex: 1,
  minWidth: 0,
  color: "#fff",
  fontSize: 14,
  paddingVertical: 10,
  paddingHorizontal: 2,
},

ft: {
  color: "#777",
  fontSize: 12,
  marginLeft: 4,
},

  // ============================================================
  // BOTTOM BUTTON
  // ============================================================

  bottomContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: "#000",
  },
});

export default styles;
