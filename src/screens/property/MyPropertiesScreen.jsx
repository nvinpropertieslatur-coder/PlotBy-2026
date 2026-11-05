import React, { useMemo, useState, useRef } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { getPropertyWorkspace } from '../../services/propertyService';

import {

  View,
  Modal,

  Text,

  ScrollView,

  StyleSheet,

  Platform,

  Pressable,

  Animated,

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import colorsV1 from '../../theme/colors.v1';

import typographyV1 from '../../theme/typography.v1';

import ButtonV1 from '../../components/ButtonV1';

import SearchBarV1 from '../../components/SearchBarV1';

import FilterChipV1 from '../../components/FilterChipV1';

import PropertyCardV1 from '../../components/PropertyCardV1';

import PropertyTypeCardV1 from '../../components/PropertyTypeCardV1';

import GlassCardV1 from '../../components/GlassCardV1';

import ProfileAvatarV1 from '../../components/ProfileAvatarV1';

import ScreenHeaderV1 from '../../components/ScreenHeaderV1';
import { NetworkErrorModal } from '../../components/modals';
import { isNetworkError } from '../../utils/networkUtils';



/* =========================================================

   DEMO PROPERTY DATA

   ========================================================= */

/* =========================================================

   FILTER DATA

   ========================================================= */

const filters = [
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },

  {

    key: 'all',

    label: 'All',

  },

  {

    key: 'verified',

    label: 'Verified',

  },

  {

    key: 'unverified',

    label: 'Unverified',

  },

  {

    key: 'archived',

    label: 'Archived',

  },

];

/* =========================================================

   PROPERTY TYPES

   ========================================================= */

const propertyTypes = [

  {

    key: 'plot',

    title: 'Plots',

    icon: '◈',

  },

  {

    key: 'agriculturalLand',

    title: 'Sheti',

    icon: '♧',

  },

];

/* =========================================================

   SCREEN

   ========================================================= */

const MyPropertiesScreen = ({

  onAddProperty,

  onPropertyPress,

  onEditProperty,

  onBack,

  onProfilePress,

  profileImage,

  onEditProfile,

  onSubscription,

  onAgentLogin,

  onBuilderLogin,

  onSavedProperties,

  onHelp,

  onLogout,

  onSignIn,

}) => {

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState('');

  const [workspaceMode, setWorkspaceMode] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  useFocusEffect(React.useCallback(() => {
    let active = true;
    let generation = 0;
    let refreshTimer;
    const load = async () => {
      const request = ++generation;
      setLoading(true); setLoadError(''); setProperties([]); setWorkspaceMode(null);
      try {
        const workspace = await getPropertyWorkspace();
        if (active && request === generation) {
          setProperties(workspace.properties); setWorkspaceMode(workspace.mode);
        }
      } catch (error) {
        if (active && request === generation) setLoadError(error?.message || 'Unable to load properties.');
      } finally {
        if (active && request === generation) setLoading(false);
      }
    };
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
      generation++; setProperties([]); setWorkspaceMode(null); setLoading(true);
      clearTimeout(refreshTimer);
      // Do not call another auth API inside Supabase's locked auth callback.
      refreshTimer = setTimeout(() => { if (active) void load(); }, 0);
    });
    return () => { active = false; generation++; clearTimeout(refreshTimer); subscription.unsubscribe(); };
  }, [reloadToken]));

  const [search, setSearch] = useState('');

  const [activeFilter, setActiveFilter] =

    useState('all');

  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const menuAnim = useRef(

    new Animated.Value(0)

    ).current;

  const toggleMenu = () => {

    if (menuOpen) {

      Animated.timing(menuAnim, {

        toValue: 0,

        duration: 180,

        useNativeDriver: true,

      }).start(() => {

        setMenuOpen(false);

      });

    } else {

      setMenuOpen(true);

      Animated.spring(menuAnim, {

        toValue: 1,

        friction: 7,

        tension: 80,

        useNativeDriver: true,

      }).start();

    }

  };

  /* =======================================================

     FILTERED PROPERTIES

     ======================================================= */

  const filteredProperties = useMemo(() => {

    const searchText = search.trim().toLowerCase();

    return properties.filter((property) => {

      if (!property || typeof property !== 'object') return false;

      const status = typeof property.status === 'string' ? property.status.toLowerCase() : '';

      const typeValue = property.property_type || property.type;
      const type = typeof typeValue === 'string' ? typeValue.toLowerCase() : '';

      const title = typeof property.title === 'string' ? property.title.toLowerCase() : '';

      const location = [property.location, property.address, property.city].filter(value => typeof value === 'string').join(' ').toLowerCase();

      const matchesFilter = activeFilter === 'all' || status === activeFilter;

      const matchesSearch =

        !searchText ||

        title.includes(searchText) ||

        location.includes(searchText) ||

        type.includes(searchText);

      return matchesFilter && matchesSearch;

    });

  }, [properties, search, activeFilter]);

  /* =======================================================

     UI

     ======================================================= */

  return (

    <SafeAreaView

    style={styles.screen}

    edges={['top', 'left', 'right']}

    >

      <ScrollView

        showsVerticalScrollIndicator={false}

        contentContainerStyle={

          styles.scrollContent

        }

      >

        {/* =================================================

            HEADER

            ================================================= */}

        <View style={styles.headerWrapper}>

     <ScreenHeaderV1

        title="My Properties"

        onBack={onBack}

        subtitle="Manage your listed properties"

        rightAction={toggleMenu}

        rightElement={

          <ProfileAvatarV1

            size={42}

            imageUri={profileImage}

          />

        }

      />

        </View>

        {/* =================================================

            WELCOME

            ================================================= */}

        <View style={styles.welcomeSection}>

          <View style={styles.welcomeText}>

            <Text style={styles.welcomeTitle}>

              Your Properties

            </Text>

            <Text style={styles.welcomeSubtitle}>

              Manage, edit, and track your

              property listings.

            </Text>

          </View>

          <ButtonV1

            title="+ Add Property"

            onPress={() => setTypePickerOpen(true)}

            style={styles.addButton}

          />

        </View>

        {/* =================================================

            SUMMARY

            ================================================= */}

        <View style={styles.summaryRow}>

          <GlassCardV1

            style={styles.summaryCard}

          >

            <Text style={styles.summaryNumber}>

              {properties.length}

            </Text>

            <Text style={styles.summaryLabel}>

              Total Properties

            </Text>

          </GlassCardV1>

          <GlassCardV1

            style={styles.summaryCard}

          >

            <Text style={styles.summaryNumber}>

              {

                properties.filter(

                  (property) =>

                    property.status === 'verified'

                ).length

              }

            </Text>

            <Text style={styles.summaryLabel}>

              Verified

            </Text>

          </GlassCardV1>

          <GlassCardV1

            style={styles.summaryCard}

          >

            <Text style={styles.summaryNumber}>

              4

            </Text>

            <Text style={styles.summaryLabel}>

              Credits

            </Text>

          </GlassCardV1>

        </View>

        {/* =================================================

            SEARCH

            ================================================= */}

        <View style={styles.searchSection}>

          <SearchBarV1

            value={search}

            onChangeText={setSearch}

            placeholder="Search properties or location..."

            showFilter={false}

          />

        </View>

        {/* =================================================

            FILTERS

            ================================================= */}

        <View style={styles.filterSection}>

          <Text style={styles.filterTitle}>

            Filter by status

          </Text>

          <ScrollView

            horizontal

            showsHorizontalScrollIndicator={false}

            contentContainerStyle={

              styles.filterList

            }

          >

            {filters.map((filter) => (

              <FilterChipV1

                key={filter.key}

                label={filter.label}

                active={

                  activeFilter === filter.key

                }

                onPress={() =>

                  setActiveFilter(filter.key)

                }

              />

            ))}

          </ScrollView>

        </View>

        {/* =================================================

            RESULTS HEADER

            ================================================= */}

        <View style={styles.resultHeader}>

          <View>

            <Text style={styles.resultTitle}>

              Properties

            </Text>

            <Text style={styles.resultSubtitle}>

              Your current listings

            </Text>

          </View>

          <Text style={styles.resultCount}>

            {filteredProperties.length} found

          </Text>

        </View>

        {/* =================================================

            PROPERTY CARDS

            ================================================= */}

        {loading && (

        <Text style={styles.emptyText}>Loading properties...</Text>

      )}

      {!loading && loadError !== '' && (
        <Pressable onPress={() => { setLoadError(''); setLoading(true); setReloadToken((value) => value + 1); }} accessibilityRole="button">
          <Text style={styles.emptyText}>{loadError} · Tap to retry</Text>
        </Pressable>

      )}

      {!loading && !loadError && (

      <View style={styles.propertyList}>

          {filteredProperties.map((property) => (

            <PropertyCardV1

              key={property.id}

              property={property}

              onPress={() =>

                onPropertyPress?.(property)

              }

              onEdit={() =>

                onEditProperty?.(property)

              }

            />

          ))}

        </View>

      )}

        {/* =================================================

            EMPTY STATE

            ================================================= */}

        {!loading && !loadError && filteredProperties.length === 0 && (

          <GlassCardV1

            style={styles.emptyCard}

          >

            <Text style={styles.emptyIcon}>

              ⌂

            </Text>

            <Text style={styles.emptyTitle}>

              {properties.length === 0 ? 'No properties added yet' : 'No properties found'}

            </Text>

            <Text style={styles.emptyText}>

              {properties.length === 0 ? 'Add a property to see it here.' : 'Try changing your search or filter.'}

            </Text>

          </GlassCardV1>

        )}

        <View style={styles.bottomSpace} />

      </ScrollView>


      <Modal
        visible={typePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerOpen(false)}
      >
        <SafeAreaView style={styles.typePickerOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setTypePickerOpen(false)}
            accessible={false}
          />
          <View style={styles.typePickerPanel} accessibilityViewIsModal>
            <Text style={styles.typePickerTitle} accessibilityRole="header">
              Select Property Type
            </Text>
            <ScrollView contentContainerStyle={styles.typeGrid}>
              {propertyTypes.map((item) => (
                <PropertyTypeCardV1
                  key={item.key}
                  title={item.title}
                  icon={item.icon}
                  onPress={() => {
                    setTypePickerOpen(false);
                    onAddProperty(item.key);
                  }}
                />
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setTypePickerOpen(false)}
              style={styles.typePickerCancel}
              accessibilityRole="button"
            >
              <Text style={styles.typePickerCancelLabel}>Cancel</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

<Modal
  visible={menuOpen}
  transparent
  animationType="fade"
  statusBarTranslucent
  onRequestClose={toggleMenu}
>
  <View style={styles.menuModalRoot}>
    <Pressable
      style={StyleSheet.absoluteFillObject}
      onPress={() => setMenuOpen(false)}
      accessibilityRole="button"
      accessibilityLabel="Close profile menu"
    />
    <View style={styles.profileMenu}>
      <Pressable
        style={styles.menuCloseButton}
        onPress={() => setMenuOpen(false)}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        hitSlop={10}
      >
        <Text style={styles.menuCloseText}>×</Text>
      </Pressable>
      {workspaceMode !== 'authenticated' && <MenuOption icon="↪" title="Sign In" onPress={() => { setMenuOpen(false); onSignIn?.(); }} />}
      <MenuOption icon="✎" title="Edit Profile" onPress={() => { setMenuOpen(false); onEditProfile?.(); }} />
      <MenuOption icon="★" title="Subscription" onPress={() => { setMenuOpen(false); onSubscription?.(); }} />
      <MenuOption icon="♙" title="Login as Agent" onPress={() => { setMenuOpen(false); onAgentLogin?.(); }} />
      <MenuOption icon="⌂" title="Login as Builder" onPress={() => { setMenuOpen(false); onBuilderLogin?.(); }} />
      <MenuOption icon="♡" title="Saved Properties" onPress={() => { setMenuOpen(false); onSavedProperties?.(); }} />
      <MenuOption icon="?" title="Help & Support" onPress={() => { setMenuOpen(false); onHelp?.(); }} />
      <MenuOption icon="↪" title="Logout" danger onPress={() => { setMenuOpen(false); onLogout?.(); }} />
    </View>
  </View>
</Modal>

      

    <NetworkErrorModal
        visible={showNetworkModal}
        loading={loading}
        onRetry={() => {
          setShowNetworkModal(false);
          setLoading(true);
          setReloadToken((v) => v + 1);
        }}
        onCancel={() => {
          setShowNetworkModal(false);
        }}
      />
    </SafeAreaView>

  );

};

/* =========================================================

   STYLES

   ========================================================= */

  const MenuOption = ({

  icon,

  title,

  onPress,

  danger = false,

}) => {

  return (

    <Pressable

      onPress={onPress}

      style={({ pressed }) => [

        styles.menuOption,

        pressed && styles.menuOptionPressed,

      ]}

    >

      <View

        style={[

          styles.menuOptionIcon,

          danger && styles.menuDangerIcon,

        ]}

      >

        <Text

          style={[

            styles.menuOptionIconText,

            danger && styles.menuDangerText,

          ]}

        >

          {icon}

        </Text>

      </View>

      <Text

        style={[

          styles.menuOptionTitle,

          danger && styles.menuDangerText,

        ]}

      >

        {title}

      </Text>

      <Text style={styles.menuArrow}>

        ›

      </Text>

    </Pressable>

  );

};

const styles = StyleSheet.create({

  /* =====================================================

   PROFILE MENU

   ===================================================== */

  menuModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'flex-end',
    paddingTop: '14%',
    paddingRight: 16,
  },
  menuCloseButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    marginRight: 10,
    marginBottom: 2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuCloseText: {
    color: '#F5F5F5',
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '400',
  },
  profileMenu: {
    width: '80%',
    maxWidth: 360,
    borderRadius: 22,
    paddingVertical: 6,
    backgroundColor: '#171917',
    borderWidth: 1.5,
    borderColor: 'rgba(124, 255, 61, 0.24)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 24,
  },
  menuOption: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderRadius: 16,
  },
  menuOptionPressed: {
    backgroundColor: 'rgba(124, 255, 61, 0.08)',
  },
  menuOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 255, 61, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 61, 0.20)',
  },
  menuOptionIconText: {
    color: '#7CFF3D',
    fontSize: 18,
    fontWeight: '700',
  },
  menuOptionTitle: {
    flex: 1,
    marginLeft: 12,
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '600',
  },
  menuArrow: {
    color: '#B8BDB8',
    fontSize: 24,
    marginRight: 3,
  },
  menuDangerIcon: {
    backgroundColor: 'rgba(255, 70, 70, 0.10)',
    borderColor: 'rgba(255, 70, 70, 0.20)',
  },
  menuDangerText: {
    color: '#FF7272',
  },

  screen: {

    flex: 1,

    backgroundColor:

      colorsV1.backgroundColor,

  },

  scrollContent: {

    width: '100%',

    maxWidth: 1200,

    alignSelf: 'center',

    paddingHorizontal: 20,

    paddingTop:

      Platform.OS === 'web'

        ? 24

        : 16,

    paddingBottom: 20,

  },

  /* HEADER */

  headerWrapper: {

    marginBottom: 20,

  },

  /* WELCOME */

  welcomeSection: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: 16,

  },

  welcomeText: {

    flex: 1,

  },

  welcomeTitle: {

    color: colorsV1.textPrimary,

    ...typographyV1.h1,

  },

  welcomeSubtitle: {

    marginTop: 5,

    color: colorsV1.textSecondary,

    ...typographyV1.body,

  },

  addButton: {

    minWidth: 145,

  },

  /* SUMMARY */

  summaryRow: {

    flexDirection: 'row',

    gap: 10,

    marginTop: 24,

  },

  summaryCard: {

    flex: 1,

    minHeight: 92,

    padding: 16,

    justifyContent: 'center',

  },

  summaryNumber: {

    color: colorsV1.primaryColor,

    ...typographyV1.h1,

    fontSize: 24,

    fontWeight: '700',

  },

  summaryLabel: {

    marginTop: 4,

    color: colorsV1.textSecondary,

    ...typographyV1.caption,

  },

  typePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  typePickerPanel: {
    width: '90%',
    maxWidth: 440,
    maxHeight: '90%',
    padding: 16,
    borderRadius: 24,
    backgroundColor: colorsV1.backgroundSecondary,
  },
  typePickerTitle: {
    ...typographyV1.h2,
    color: colorsV1.textPrimary,
    marginBottom: 16,
  },
  typePickerCancel: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  typePickerCancelLabel: {
    ...typographyV1.caption,
    color: colorsV1.textPrimary,
  },


  typeGrid: {

    width: '100%',

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 12,

  },

  /* SEARCH */

  searchSection: {

    marginTop: 24,

  },

  /* FILTER */

  filterSection: {

    marginTop: 18,

  },

  filterTitle: {

    marginBottom: 9,

    color: colorsV1.textSecondary,

    ...typographyV1.caption,

    fontWeight: '600',

  },

  filterList: {

    gap: 8,

    paddingBottom: 2,

  },

  /* RESULTS */

  resultHeader: {

    marginTop: 26,

    marginBottom: 12,

    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent: 'space-between',

  },

  resultTitle: {

    color: colorsV1.textPrimary,

    ...typographyV1.h2,

  },

  resultSubtitle: {

    marginTop: 2,

    color: colorsV1.textMuted,

    ...typographyV1.caption,

  },

  resultCount: {

    color: colorsV1.textSecondary,

    ...typographyV1.caption,

  },

  /* PROPERTY LIST */

  propertyList: {

    gap: 14,

  },

  /* EMPTY */

  emptyCard: {

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 45,

    marginTop: 10,

  },

  emptyIcon: {

    color: colorsV1.primaryColor,

    fontSize: 38,

  },

  emptyTitle: {

    marginTop: 12,

    color: colorsV1.textPrimary,

    ...typographyV1.h3,

  },

  emptyText: {

    marginTop: 6,

    color: colorsV1.textSecondary,

    ...typographyV1.body,

    textAlign: 'center',

  },

  bottomSpace: {

    height: 20,

  },

});

export default MyPropertiesScreen;
