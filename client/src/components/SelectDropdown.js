import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { FiChevronDown, FiCheck } from './Icons';

/**
 * Shadcn-UI inspired Select Dropdown
 * Modern, clean, bordered with custom popover and checkmark indicators
 */
export const SelectDropdown = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Select an option...',
  disabled = false,
  error,
  style,
  dropdownStyle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label || String(opt.value),
      badge: opt.badge,
      icon: opt.icon,
    };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  const handleSelect = (val) => {
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style, isOpen && styles.containerOpen]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.selectWrapper, isOpen && styles.selectWrapperOpen]} ref={containerRef}>
        {/* Trigger Button (Shadcn style trigger) */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => setIsOpen((prev) => !prev)}
          style={[
            styles.trigger,
            isOpen && styles.triggerOpen,
            error && styles.triggerError,
            disabled && styles.triggerDisabled,
          ]}
        >
          <View style={styles.triggerValueRow}>
            {selectedOption?.icon && (
              <View style={styles.optionIcon}>{selectedOption.icon}</View>
            )}
            <Text
              style={[
                styles.triggerText,
                !selectedOption && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
          </View>

          <FiChevronDown
            size={14}
            color={isOpen ? '#2563EB' : '#64748B'}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
              flexShrink: 0,
            }}
          />
        </TouchableOpacity>

        {/* Floating Backdrop for Outside Click */}
        {isOpen && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
            style={styles.backdrop}
          />
        )}

        {/* Floating Popover (Shadcn style Content) */}
        {isOpen && (
          <View style={[styles.popover, dropdownStyle]}>
            <ScrollView
              style={styles.scrollList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {normalizedOptions.length === 0 ? (
                <View style={styles.emptyItem}>
                  <Text style={styles.emptyText}>No options available</Text>
                </View>
              ) : (
                normalizedOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <TouchableOpacity
                      key={String(opt.value)}
                      activeOpacity={0.7}
                      style={[
                        styles.item,
                        isSelected && styles.itemSelected,
                      ]}
                      onPress={() => handleSelect(opt.value)}
                    >
                      <View style={styles.itemLeftRow}>
                        {opt.icon && <View style={styles.optionIcon}>{opt.icon}</View>}
                        <Text
                          style={[
                            styles.itemText,
                            isSelected && styles.itemTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {opt.label}
                        </Text>
                      </View>

                      {isSelected && (
                        <FiCheck size={14} color="#2563EB" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  containerOpen: {
    zIndex: 9999,
    elevation: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  selectWrapper: {
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
  selectWrapperOpen: {
    zIndex: 9999,
  },
  trigger: {
    minHeight: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    cursor: 'pointer',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerOpen: {
    borderColor: '#2563EB',
  },
  triggerError: {
    borderColor: '#EF4444',
  },
  triggerDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  triggerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    overflow: 'hidden',
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  optionIcon: {
    marginRight: 4,
  },
  backdrop: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: Platform.OS === 'web' ? 0 : -1000,
    left: Platform.OS === 'web' ? 0 : -1000,
    right: Platform.OS === 'web' ? 0 : -1000,
    bottom: Platform.OS === 'web' ? 0 : -1000,
    zIndex: 9998,
    backgroundColor: 'transparent',
    cursor: 'default',
  },
  popover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    minWidth: '100%',
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 35,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    maxHeight: 240,
  },
  scrollList: {
    maxHeight: 232,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    cursor: 'pointer',
    marginVertical: 1,
  },
  itemSelected: {
    backgroundColor: '#EFF6FF',
  },
  itemLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
  },
  itemTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  emptyItem: {
    padding: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
});
