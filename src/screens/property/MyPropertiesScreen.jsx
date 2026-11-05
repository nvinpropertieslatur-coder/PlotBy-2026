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
import { Menu } from 'lucide-react-native';
import ScreenHeaderV1 from '../../components/ScreenHeaderV1';
import { NetworkErrorModal } from '../../components/modals';

/* FILTER DATA */
const filters = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: 'unverified', label: 'Unverified' },
  { key: 'archived', label: 'Archived' },
];

/* PROPERTY TYPES */
const propertyTypes = [
  { key: 'plot', title: 'Plots', icon: '◈' },
  { key: 'agriculturalLand', title: 'Sheti', icon: '♧' },
];

/* SCREEN */
const MyPropertiesScreen = ({
  onAddProperty,
  onPropertyPress,
  onEditProperty,
  onBack,
  onProfilePress,
  onEditProfile,
  onSubscription,
  onSavedProperties,
  onHelp,
  onLogout,
}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [workspaceMode, setWorkspaceMode] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      let generation = 0;
      let refreshTimer;

      const load = async () => {
        const request = ++generation;

        setLoading(true);
        setLoadError('');
        setProperties([]);
        setWorkspaceMode(null);

        try {
          const workspace = await getPropertyWorkspace();

          if (active && request === generation) {
            setProperties(workspace.properties);
            setWorkspaceMode(workspace.mode);
          }
        } catch (error) {
          if (active && request === generation) {
            setLoadError(
              error?.message || 'Unable to load properties.'
            );
          }
        } finally {
          if (active && request === generation) {
            setLoading(false);
          }
        }
      };

      void load();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (
          event === 'INITIAL_SESSION' ||
          event === 'TOKEN_REFRESHED'
        ) {
          return;
        }

        generation++;
        setProperties([]);
        setWorkspaceMode(null);
        setLoading(true);

        clearTimeout(refreshTimer);

        refreshTimer = setTimeout(() => {
          if (active) void load();
        }, 0);
      });

      return () => {
        active = false;
        generation++;
        clearTimeout(refreshTimer);
        subscription.unsubscribe();
      };
    }, [reloadToken])
  );

  const [search, setSearch] = useState('');
  const noProperties = properties.length === 0;

  const [activeFilter, setActiveFilter] = useState('all');

  const selectedFilterLabel = filters
    .find((filter) => filter.key === activeFilter)
    ?.label.toLowerCase();

  const [typePickerOpen, setTypePickerOpen] = useState(false);

  // FIX: Add Property button handler
  const handleAddProperty = () => {
    setTypePickerOpen(true);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const menuAnim = useRef(new Animated.Value(0)).current;

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

  /* FILTERED PROPERTIES */
  const filteredProperties = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return properties.filter((property) => {
      if (!property || typeof property !== 'object') {
        return false;
      }

      const status =
        typeof property.status === 'string'
          ? property.status.toLowerCase()
          : '';

      const typeValue =
        property.property_type || property.type;

      const type =
        typeof typeValue === 'string'
          ? typeValue.toLowerCase()
          : '';

      const title =
        typeof property.title === 'string'
          ? property.title.toLowerCase()
          : '';

      const location = [
        property.location,
        property.address,
        property.city,
      ]
        .filter((value) => typeof value === 'string')
        .join(' ')
        .toLowerCase();

      const area =
        property.total_area == null
          ? ''
          : `${property.total_area} sq.ft.`.toLowerCase();

      const isUnverified = [
        'pending',
        'pending_verification',
        'rejected',
        'unverified',
      ].includes(status);

      const matchesFilter =
        activeFilter === 'all' ||
        status === activeFilter ||
        (activeFilter === 'unverified' && isUnverified);

      const matchesSearch =
        !searchText ||
        title.includes(searchText) ||
        location.includes(searchText) ||
        area.includes(searchText) ||
        type.includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [properties, search, activeFilter]);

  /* UI */
  return (
    <SafeAreaView
      style={styles.screen}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.headerWrapper}>
          <ScreenHeaderV1
            title="My Properties"
            onBack={onBack}
            subtitle="Manage your listed properties"
            rightAction={toggleMenu}
            rightElement={
              <Menu
                size={24}
                color={colorsV1.primaryColor}
              />
            }
          />
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              Your Properties
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Manage, edit, and track your property listings.
            </Text>
          </View>

          <ButtonV1
            title="+ Add Property"
            onPress={() => setTypePickerOpen(true)}
            style={styles.addButton}
          />
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryRow}>
          <GlassCardV1 style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {properties.length}
            </Text>
            <Text style={styles.summaryLabel}>
              Total Properties
            </Text>
          </GlassCardV1>

          <GlassCardV1 style={styles.summaryCard}>
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

          <GlassCardV1 style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>4</Text>
            <Text style={styles.summaryLabel}>
              Credits
            </Text>
          </GlassCardV1>
        </View>

        {/* FILTERS */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>
            Filter by status
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {filters.map((filter) => (
              <FilterChipV1
                key={filter.key}
                label={filter.label}
                active={activeFilter === filter.key}
                onPress={() =>
                  setActiveFilter(filter.key)
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* RESULTS HEADER */}
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

        {/* SEARCH */}
        <View style={styles.searchSection}>
          <SearchBarV1
            value={search}
            onChangeText={setSearch}
            placeholder="Search title, location or area..."
            showFilter={false}
          />
        </View>

        {/* PROPERTY CARDS */}
        {loading && (
          <Text style={styles.emptyText}>
            Loading properties...
          </Text>
        )}

        {!loading && loadError !== '' && (
          <Pressable
            onPress={() => {
              setLoadError('');
              setLoading(true);
              setReloadToken((value) => value + 1);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.emptyText}>
              {loadError} · Tap to retry
            </Text>
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

        {/* EMPTY STATE */}
        {!loading &&
          !loadError &&
          filteredProperties.length === 0 && (
            <GlassCardV1 style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>⌂</Text>

              <Text style={styles.emptyTitle}>
                {noProperties
                  ? workspaceMode === 'authenticated'
                    ? "You haven't added any property yet."
                    : 'No properties added yet'
                  : search.trim()
                    ? 'No matching properties'
                    : activeFilter === 'all'
                      ? 'No properties in this category'
                      : `No ${selectedFilterLabel} properties`}
              </Text>

              <Text style={styles.emptyText}>
                {noProperties
                  ? 'Add your first property to see and manage it here.'
                  : search.trim()
                    ? 'Try another title, location or area.'
                    : 'Choose another filter or property type.'}
              </Text>

              {noProperties && (
                <ButtonV1
                  title="Add Property"
                  onPress={handleAddProperty}
                  style={styles.addButton}
                />
              )}
            </GlassCardV1>
          )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* PROPERTY TYPE PICKER */}
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

          <View
            style={styles.typePickerPanel}
            accessibilityViewIsModal
          >
            <Text
              style={styles.typePickerTitle}
              accessibilityRole="header"
            >
              Select Property Type
            </Text>

            <ScrollView
              contentContainerStyle={styles.typeGrid}
            >
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
              <Text style={styles.typePickerCancelLabel}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* PROFILE MENU */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuOpen(false)}
      >
        <SafeAreaView style={styles.menuModalRoot}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close profile menu"
          />

          <ScrollView
            style={styles.profileMenu}
            bounces={false}
          >
            <Pressable
              style={styles.menuCloseButton}
              onPress={() => setMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              hitSlop={10}
            >
              <Text style={styles.menuCloseText}>×</Text>
            </Pressable>

            <MenuOption
              icon="✎"
              title="Edit Profile"
              onPress={() => {
                setMenuOpen(false);
                onEditProfile?.();
              }}
            />

            <MenuOption
              icon="★"
              title="Subscription"
              onPress={() => {
                setMenuOpen(false);
                onSubscription?.();
              }}
            />

            <MenuOption
              icon="♡"
              title="Favourite"
              onPress={() => {
                setMenuOpen(false);
                onSavedProperties?.();
              }}
            />

            <MenuOption
              icon="?"
              title="Help & Support"
              onPress={() => {
                setMenuOpen(false);
                onHelp?.();
              }}
            />

            <MenuOption
              icon="↪"
              title="Log Out"
              danger
              onPress={() => {
                setMenuOpen(false);
                onLogout?.();
              }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* NETWORK ERROR MODAL */}
      <NetworkErrorModal
        visible={showNetworkModal}
        loading={loading}
        onRetry={() => {
          setShowNetworkModal(false);
          setLoading(true);
          setReloadToken((value) => value + 1);
        }}
        onCancel={() => {
          setShowNetworkModal(false);
        }}
      />
    </SafeAreaView>
  );
};

/* MENU OPTION */
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

      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
};

/* STYLES */
const styles = StyleSheet.create({
  menuModalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'flex-end',
    paddingBottom: 16,
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
    flexGrow: 0,
    marginTop: 56,
    marginHorizontal: 16,
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
    backgroundColor: colorsV1.backgroundColor,
  },

  scrollContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 24 : 16,
    paddingBottom: 20,
  },

  headerWrapper: {
    marginBottom: 20,
  },

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

  searchSection: {
    marginTop: 24,
  },

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

  propertyList: {
    gap: 14,
  },

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