// @ts-nocheck
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

  button: {
    height: 50,

    width: "100%",

    backgroundColor: "#8CFF32",

    borderRadius: 12,

    alignItems: "center",

    justifyContent: "center",

    flexDirection: "row",

    shadowColor: "#8CFF32",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.30,

    shadowRadius: 8,

    elevation: 7,
  },

  buttonText: {
    color: "#101010",

    fontSize: 16,

    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.5,
  },

});

export default styles;