// @ts-nocheck
import React from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';

import colorsV1 from '../theme/colors.v1';


const ProfileAvatarV1 = ({
  size = 40,
  imageUri = null,
}) => {

  const headSize = size * 0.30;
  const bodyWidth = size * 0.50;
  const bodyHeight = size * 0.32;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >

      {imageUri ? (

        <View
          style={[
            styles.imageWrapper,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {/* Real profile photo will go here later */}
        </View>

      ) : (

        <>
          {/* USER HEAD */}
          <View
            style={[
              styles.head,
              {
                width: headSize,
                height: headSize,
                borderRadius: headSize / 2,
                top: size * 0.20,
              },
            ]}
          />

          {/* USER BODY */}
          <View
            style={[
              styles.body,
              {
                width: bodyWidth,
                height: bodyHeight,
                borderTopLeftRadius: bodyWidth / 2,
                borderTopRightRadius: bodyWidth / 2,
                bottom: size * 0.16,
              },
            ]}
          />
        </>

      )}

    </View>
  );
};


const styles = StyleSheet.create({

  container: {
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(124,255,61,0.08)',

    borderWidth: 1,

    borderColor:
      colorsV1.primaryColor,

    overflow: 'hidden',
  },


  head: {
    position: 'absolute',

    backgroundColor:
      colorsV1.primaryColor,
  },


  body: {
    position: 'absolute',

    backgroundColor:
      colorsV1.primaryColor,
  },


  imageWrapper: {
    overflow: 'hidden',

    backgroundColor:
      colorsV1.backgroundSecondary,
  },

});


export default ProfileAvatarV1;